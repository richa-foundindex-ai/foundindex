import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============================================================================
// TYPES
// =============================================================================

type ErrorType =
  | "RATE_LIMIT_IP"
  | "RATE_LIMIT_URL"
  | "SITE_UNREACHABLE"
  | "BOT_BLOCKED"
  | "TIMEOUT"
  | "API_QUOTA"
  | "GENERAL_ERROR";

interface ErrorResponse {
  success: false;
  error_type: ErrorType;
  error_code: string;
  user_message: string;
  next_available_time?: string;
  suggested_action: string;
  technical_details?: string;
  cached_test_id?: string;
  cached_score?: number;
  cached_created_at?: string;
}

interface TestSubmission {
  website: string;
  testType: "homepage" | "blog";
  email?: string;
}

interface SchemaItem {
  type: string;
  properties: Record<string, unknown>;
  isValid: boolean;
  errors: string[];
}

interface SchemaScore {
  category: string;
  maxPoints: number;
  earnedPoints: number;
  found: boolean;
  details: string;
  missingFields: string[];
}

interface SchemaParseResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  schemas: SchemaItem[];
  scores: SchemaScore[];
  summary: string;
}

// =============================================================================
// SCHEMA.ORG PARSER - FIXED VERSION
// =============================================================================

// TYPE ALIASES - This fixes the Article/BlogPosting issue!
const SCHEMA_TYPE_ALIASES: Record<string, string[]> = {
  Organization: ["Organization", "Corporation", "LocalBusiness", "EntertainmentBusiness"],
  Article: ["Article", "BlogPosting", "NewsArticle", "TechArticle", "ScholarlyArticle", "Report"],
};

const SCHEMA_REQUIREMENTS: Record<string, { required: string[]; recommended: string[]; points: number }> = {
  Organization: {
    required: ["name"],
    recommended: ["url", "logo", "description", "sameAs", "contactPoint", "address", "founder"],
    points: 5,
  },
  Article: {
    required: ["headline", "author", "datePublished"],
    recommended: ["dateModified", "image", "publisher", "description", "mainEntityOfPage"],
    points: 8,
  },
  BlogPosting: {
    required: ["headline", "author", "datePublished"],
    recommended: ["dateModified", "image", "publisher", "description", "mainEntityOfPage", "wordCount"],
    points: 8,
  },
  FAQPage: {
    required: ["mainEntity"],
    recommended: [],
    points: 4,
  },
  BreadcrumbList: {
    required: ["itemListElement"],
    recommended: [],
    points: 2,
  },
  ContactPoint: {
    required: ["contactType"],
    recommended: ["telephone", "email", "areaServed"],
    points: 2,
  },
  WebSite: {
    required: ["name"],
    recommended: ["url", "potentialAction", "description"],
    points: 3,
  },
  WebPage: {
    required: ["name"],
    recommended: ["description", "url", "breadcrumb", "mainEntity"],
    points: 2,
  },
  SoftwareApplication: {
    required: ["name"],
    recommended: ["description", "applicationCategory", "operatingSystem", "offers", "aggregateRating"],
    points: 6,
  },
  Product: {
    required: ["name"],
    recommended: ["description", "brand", "offers", "image", "sku"],
    points: 6,
  },
  Service: {
    required: ["name"],
    recommended: ["description", "provider", "areaServed", "serviceType"],
    points: 6,
  },
  LocalBusiness: {
    required: ["name", "address"],
    recommended: ["telephone", "openingHours", "geo", "priceRange"],
    points: 7,
  },
  Person: {
    required: ["name"],
    recommended: ["url", "image", "jobTitle", "sameAs"],
    points: 4,
  },
  Review: {
    required: ["author"],
    recommended: ["reviewRating", "itemReviewed", "reviewBody"],
    points: 2,
  },
  HowTo: {
    required: ["name", "step"],
    recommended: ["description", "image", "totalTime"],
    points: 3,
  },
};

function extractJsonLd(html: string): unknown[] {
  const jsonLdItems: unknown[] = [];
  const jsonLdRegex = /<script[^>]*type\s*=\s*['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonContent = match[1].trim();
      const parsed = JSON.parse(jsonContent);

      if (parsed && typeof parsed === "object") {
        if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
          jsonLdItems.push(...parsed["@graph"]);
        } else if (Array.isArray(parsed)) {
          jsonLdItems.push(...parsed);
        } else {
          jsonLdItems.push(parsed);
        }
      }
    } catch {
      // Malformed JSON-LD, skip
    }
  }

  return jsonLdItems;
}

function getSchemaType(item: unknown): string | null {
  if (!item || typeof item !== "object") return null;

  const obj = item as Record<string, unknown>;
  const typeValue = obj["@type"];

  if (typeof typeValue === "string") {
    const match = typeValue.match(/(?:schema\.org\/)?(\w+)$/);
    return match ? match[1] : typeValue;
  }

  if (Array.isArray(typeValue) && typeValue.length > 0) {
    const first = typeValue[0];
    if (typeof first === "string") {
      const match = first.match(/(?:schema\.org\/)?(\w+)$/);
      return match ? match[1] : first;
    }
  }

  return null;
}

function getProperties(item: unknown): Record<string, unknown> {
  if (!item || typeof item !== "object") return {};

  const obj = item as Record<string, unknown>;
  const properties: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!key.startsWith("@")) {
      properties[key] = value;
    }
  }

  return properties;
}

// FIXED: Check if author exists in multiple formats
function hasAuthor(properties: Record<string, unknown>): boolean {
  if (!properties.author) return false;

  const author = properties.author;

  // String author
  if (typeof author === "string" && author.trim().length > 0) {
    return true;
  }

  // Object author with name
  if (author && typeof author === "object") {
    const authorObj = author as Record<string, unknown>;
    if (authorObj.name && typeof authorObj.name === "string" && authorObj.name.trim().length > 0) {
      return true;
    }
  }

  // Array of authors
  if (Array.isArray(author) && author.length > 0) {
    const firstAuthor = author[0];
    if (typeof firstAuthor === "string" && firstAuthor.trim().length > 0) {
      return true;
    }
    if (firstAuthor && typeof firstAuthor === "object") {
      const firstAuthorObj = firstAuthor as Record<string, unknown>;
      if (firstAuthorObj.name && typeof firstAuthorObj.name === "string") {
        return true;
      }
    }
  }

  return false;
}

function parseJsonLdItems(jsonLdItems: unknown[]): SchemaItem[] {
  const schemaItems: SchemaItem[] = [];
  const visited = new Set<unknown>();

  const processItem = (item: unknown) => {
    if (visited.has(item)) return;
    visited.add(item);

    const type = getSchemaType(item);
    if (!type) return;

    const properties = getProperties(item);
    const requirements = SCHEMA_REQUIREMENTS[type];

    let isValid = true;
    const errors: string[] = [];

    if (requirements) {
      for (const field of requirements.required) {
        // Special handling for author field
        if (field === "author") {
          if (!hasAuthor(properties)) {
            errors.push(`Missing required field: ${field}`);
            isValid = false;
          }
        } else {
          if (!(field in properties) || properties[field] === null || properties[field] === undefined) {
            errors.push(`Missing required field: ${field}`);
            isValid = false;
          }
        }
      }
    }

    schemaItems.push({ type, properties, isValid, errors });

    for (const value of Object.values(properties)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const valueObj = value as Record<string, unknown>;
        if ("@type" in valueObj) {
          processItem(value);
        }
      }
      if (Array.isArray(value)) {
        for (const arrItem of value) {
          if (arrItem && typeof arrItem === "object") {
            const arrItemObj = arrItem as Record<string, unknown>;
            if ("@type" in arrItemObj) {
              processItem(arrItem);
            }
          }
        }
      }
    }
  };

  for (const item of jsonLdItems) {
    processItem(item);
  }

  return schemaItems;
}

function scoreSchemaType(type: string, items: SchemaItem[]): SchemaScore {
  const requirements = SCHEMA_REQUIREMENTS[type];

  if (!requirements) {
    return {
      category: type,
      maxPoints: 0,
      earnedPoints: 0,
      found: false,
      details: `Unknown schema type: ${type}`,
      missingFields: [],
    };
  }

  // FIXED: Check for type aliases
  const aliases = SCHEMA_TYPE_ALIASES[type] || [type];
  console.log(
    `[alias-debug] Scoring ${type}, aliases: ${JSON.stringify(aliases)}, found schemas: ${items.map((s) => s.type).join(", ")}`,
  );
  const matchingItems = items.filter((item) => aliases.includes(item.type));

  if (matchingItems.length === 0) {
    return {
      category: type,
      maxPoints: requirements.points,
      earnedPoints: 0,
      found: false,
      details: `No ${type} schema found`,
      missingFields: requirements.required,
    };
  }

  let bestItem = matchingItems[0];
  let bestFieldCount = 0;

  for (const item of matchingItems) {
    const allFields = [...requirements.required, ...requirements.recommended];
    let presentCount = 0;

    for (const field of allFields) {
      if (field === "author") {
        if (hasAuthor(item.properties)) presentCount++;
      } else {
        if (field in item.properties) presentCount++;
      }
    }

    if (presentCount > bestFieldCount) {
      bestFieldCount = presentCount;
      bestItem = item;
    }
  }

  // FIXED: Check for missing required fields properly
  const missingRequired = requirements.required.filter((f) => {
    if (f === "author") {
      return !hasAuthor(bestItem.properties);
    }
    return !(f in bestItem.properties);
  });

  const requiredScore =
    requirements.required.length > 0
      ? ((requirements.required.length - missingRequired.length) / requirements.required.length) * 0.6
      : 0.6;

  const presentRecommended = requirements.recommended.filter((f) => f in bestItem.properties).length;
  const recommendedScore =
    requirements.recommended.length > 0 ? (presentRecommended / requirements.recommended.length) * 0.4 : 0.4;

  const totalPercentage = requiredScore + recommendedScore;
  const earnedPoints = Math.round(requirements.points * totalPercentage * 10) / 10;

  let details = `Found ${matchingItems.length} ${bestItem.type} schema(s). `;
  if (missingRequired.length > 0) {
    details += `Missing: ${missingRequired.join(", ")}. `;
  }
  if (presentRecommended > 0) {
    details += `Has ${presentRecommended}/${requirements.recommended.length} recommended fields.`;
  }

  return {
    category: type,
    maxPoints: requirements.points,
    earnedPoints,
    found: true,
    details,
    missingFields: missingRequired,
  };
}

function parseSchemaMarkup(html: string, pageType: "homepage" | "blog"): SchemaParseResult {
  const jsonLdItems = extractJsonLd(html);
  const allSchemas = parseJsonLdItems(jsonLdItems);

  console.log(`[schema-debug] Extracted ${jsonLdItems.length} JSON-LD blocks`);
  console.log(`[schema-debug] Found ${allSchemas.length} total schemas: ${allSchemas.map((s) => s.type).join(", ")}`);

  const schemasToScore =
    pageType === "homepage"
      ? ["Organization", "WebSite", "WebPage", "FAQPage", "SoftwareApplication", "Product", "Service", "BreadcrumbList"]
      : ["Article", "BlogPosting", "FAQPage", "BreadcrumbList", "WebPage", "HowTo"];

  const scores: SchemaScore[] = [];

  for (const schemaType of schemasToScore) {
    // FIXED: For blogs, if we have Article schema, don't penalize for missing BlogPosting
    if (schemaType === "BlogPosting" && pageType === "blog") {
      const hasArticle = allSchemas.some((s) =>
        ["Article", "BlogPosting", "NewsArticle", "TechArticle"].includes(s.type),
      );
      if (hasArticle) {
        console.log(`[schema-debug] Skipping BlogPosting check - Article schema already found`);
        continue;
      }
    }

    scores.push(scoreSchemaType(schemaType, allSchemas));
  }

  const totalScore = scores.reduce((sum, s) => sum + s.earnedPoints, 0);
  const maxScore = scores.reduce((sum, s) => sum + s.maxPoints, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const foundCount = scores.filter((s) => s.found).length;

  let summary = "";
  if (allSchemas.length === 0) {
    summary = "No schema.org markup detected. AI systems cannot parse your content structure.";
  } else if (percentage >= 80) {
    summary = `Strong schema implementation. ${foundCount}/${scores.length} key schemas at ${percentage}% completeness.`;
  } else if (percentage >= 50) {
    summary = `Partial schema coverage. ${foundCount}/${scores.length} schemas found. Add missing types.`;
  } else {
    summary = `Weak schema markup. Only ${foundCount}/${scores.length} schemas at ${percentage}% completeness.`;
  }

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    maxScore,
    percentage,
    schemas: allSchemas,
    scores,
    summary,
  };
}

// =============================================================================
// SEMANTIC HTML ANALYZER
// =============================================================================

function analyzeSemanticHtml(html: string, pageType: "homepage" | "blog") {
  // Check for semantic HTML5 elements
  const checks = {
    hasArticleTag: /<article[\s>]/i.test(html),
    hasSectionTags: /<section[\s>]/i.test(html),
    hasNavTag: /<nav[\s>]/i.test(html),
    hasAsideTag: /<aside[\s>]/i.test(html),
    hasFigureTags: /<figure[\s>]/i.test(html),
    hasHeaderFooter: /<header[\s>]/i.test(html) && /<footer[\s>]/i.test(html),
    hasMain: /<main[\s>]/i.test(html),
  };

  // Check heading hierarchy (H1 → H2 → H3, no skipped levels)
  const hasH1 = /<h1[\s>]/i.test(html);
  const hasH2 = /<h2[\s>]/i.test(html);
  const hasH3 = /<h3[\s>]/i.test(html);

  // Count heading occurrences
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const h3Count = (html.match(/<h3[\s>]/gi) || []).length;

  // Validate heading hierarchy
  const hasProperH1 = h1Count === 1; // Should have exactly one H1
  const hasProperHierarchy = hasH1 && (hasH2 || !hasH3); // Don't skip H2 to go to H3
  const hasGoodHeadingStructure = hasProperH1 && hasH2 && h2Count >= 2; // Multiple H2s indicate good structure

  const headingChecks = {
    hasProperH1,
    hasProperHierarchy,
    hasGoodHeadingStructure,
  };

  const weights =
    pageType === "homepage"
      ? {
          hasArticleTag: 2,
          hasSectionTags: 3,
          hasNavTag: 3,
          hasAsideTag: 1,
          hasFigureTags: 2,
          hasHeaderFooter: 3,
          hasMain: 3,
          hasProperH1: 2,
          hasProperHierarchy: 2,
          hasGoodHeadingStructure: 2,
        }
      : {
          hasArticleTag: 4,
          hasSectionTags: 3,
          hasNavTag: 2,
          hasAsideTag: 2,
          hasFigureTags: 3,
          hasHeaderFooter: 2,
          hasMain: 2,
          hasProperH1: 2,
          hasProperHierarchy: 2,
          hasGoodHeadingStructure: 2,
        };

  const maxScore = pageType === "homepage" ? 23 : 24;
  let score = 0;

  const allChecks = { ...checks, ...headingChecks };

  for (const [key, passed] of Object.entries(allChecks)) {
    if (passed) {
      score += weights[key as keyof typeof weights] || 0;
    }
  }

  console.log(`[semantic-debug] Checks: ${JSON.stringify(allChecks)}, Score: ${score}/${maxScore}`);

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: {
      ...checks,
      headings: {
        h1Count,
        h2Count,
        h3Count,
        hasProperH1,
        hasProperHierarchy,
        hasGoodHeadingStructure,
      },
    },
  };
}

// =============================================================================
// TECHNICAL FOUNDATION ANALYZER
// =============================================================================

function analyzeTechnical(url: string, html: string) {
  const checks = {
    hasViewportMeta: /<meta[^>]*name\s*=\s*["']viewport["'][^>]*>/i.test(html),
    isHttps: url.startsWith("https://"),
    hasCanonical: /<link[^>]*rel\s*=\s*["']canonical["'][^>]*>/i.test(html),
    hasLangAttribute: /<html[^>]*lang\s*=/i.test(html),
    hasCharset: /<meta[^>]*charset/i.test(html),
    hasTitle: /<title[^>]*>[^<]+<\/title>/i.test(html),
    hasMetaDescription: /<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["'][^"']+["']/i.test(html),
    hasH1: /<h1[\s>]/i.test(html),
  };

  const weights = {
    hasViewportMeta: 1,
    isHttps: 2,
    hasCanonical: 2,
    hasLangAttribute: 1,
    hasCharset: 1,
    hasTitle: 2,
    hasMetaDescription: 2,
    hasH1: 2,
  };
  const maxScore = 13;
  let score = 0;

  for (const [key, passed] of Object.entries(checks)) {
    if (passed) {
      score += weights[key as keyof typeof weights] || 0;
    }
  }

  return { score: Math.min(score, maxScore), maxScore, details: checks };
}

// =============================================================================
// IMAGE ANALYZER
// =============================================================================

function analyzeImages(html: string, pageType: "homepage" | "blog") {
  const imgRegex = /<img[^>]*>/gi;
  const imgTags = html.match(imgRegex) || [];

  let withAltText = 0;
  let withDescriptiveAlt = 0;

  for (const img of imgTags) {
    const altMatch = img.match(/alt\s*=\s*["']([^"']*)["']/i);
    if (altMatch) {
      withAltText++;
      const altText = altMatch[1].trim();
      if (altText.length > 10 && !altText.match(/^(image|photo|picture|img|icon|logo|banner|header)$/i)) {
        withDescriptiveAlt++;
      }
    }
  }

  const totalImages = imgTags.length;
  const maxScore = 10;

  let score = 0;
  if (totalImages === 0) {
    score = pageType === "blog" ? 2 : 5;
  } else {
    const altRatio = withAltText / totalImages;
    const descriptiveRatio = withDescriptiveAlt / totalImages;
    score = Math.round((altRatio * 0.5 + descriptiveRatio * 0.5) * maxScore * 10) / 10;
  }

  return { score: Math.min(score, maxScore), maxScore, details: { totalImages, withAltText, withDescriptiveAlt } };
}

// =============================================================================
// HELPERS
// =============================================================================

const validateEmail = (email: string | undefined): string => {
  if (!email) return `anonymous-${Date.now()}@foundindex.local`;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 255) throw new Error("Email must be less than 255 characters");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) throw new Error("Invalid email format");
  return trimmed;
};

const normalizeUrl = (url: string): string => {
  let normalized = url.trim().toLowerCase();
  try {
    if (!normalized.includes("://")) {
      normalized = "https://" + normalized;
    }
    return new URL(normalized).href;
  } catch {
    if (!normalized.includes("://")) {
      normalized = "https://" + normalized;
    }
    return normalized;
  }
};

const validateWebsite = (website: string): string => {
  const trimmed = website.trim();
  if (!trimmed) throw new Error("Please enter a website URL");
  const normalized = normalizeUrl(trimmed);
  if (normalized.includes(".")) return normalized;
  throw new Error('Please enter a valid website URL (like "example.com")');
};

const detectPageType = (url: string, html: string, requestedType: "homepage" | "blog"): "homepage" | "blog" => {
  const urlLower = url.toLowerCase();

  let path = "";
  try {
    const urlObj = new URL(url);
    path = urlObj.pathname.toLowerCase();
  } catch {
    path = urlLower;
  }

  if (path === "/" || path === "") {
    return "homepage";
  }

  if (requestedType === "blog" && path.length > 1) {
    return "blog";
  }

  const blogPatterns = [
    "/blog/",
    "/post/",
    "/article/",
    "/news/",
    "/insights/",
    "/stories/",
    "/journal/",
    "/travel-guide",
    "/guide-",
    "/how-to-",
    "/what-is-",
    "/best-",
    "/top-",
    "/review-",
    "-tips",
    "-guide",
    "-tutorial",
    "-explained",
  ];
  const hasBlogUrl = blogPatterns.some((pattern) => path.includes(pattern));

  const datePattern = /\/\d{4}\/\d{2}\//;
  const hasDateUrl = datePattern.test(urlLower);

  const hasBlogSubdomain = /^https?:\/\/blog\./i.test(url);

  const hasBlogSchema =
    html.includes('"@type":"BlogPosting"') ||
    html.includes('"@type":"Article"') ||
    html.includes('"@type": "BlogPosting"') ||
    html.includes('"@type": "Article"');

  if (hasBlogUrl || hasDateUrl || hasBlogSubdomain || hasBlogSchema) {
    return "blog";
  }

  return requestedType;
};

const getGrade = (score: number): string => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

// =============================================================================
// ERROR RESPONSE HELPER
// =============================================================================

const createErrorResponse = (
  type: ErrorType,
  details: Partial<Omit<ErrorResponse, "success" | "error_type">>,
): Response => {
  const response: ErrorResponse = {
    success: false,
    error_type: type,
    error_code: details.error_code || `${type}_${Date.now()}`,
    user_message: details.user_message || "An error occurred",
    suggested_action: details.suggested_action || "Please try again",
    ...details,
  };

  console.error("FoundIndex Error:", response);

  return new Response(JSON.stringify(response), {
    status: type.startsWith("RATE_LIMIT") ? 429 : 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

const formatDateForUser = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

// =============================================================================
// RATE LIMITING WITH CACHING
// =============================================================================

interface CachedTestResult {
  allowed: boolean;
  daysRemaining?: number;
  lastTestDate?: string;
  cachedTestId?: string;
  cachedScore?: number;
  cachedCreatedAt?: string;
}

const checkRateLimitWithCache = async (supabase: any, url: string): Promise<CachedTestResult> => {
  const COOLDOWN_DAYS = 7;

  try {
    const { data, error } = await supabase
      .from("test_history")
      .select("test_id, score, created_at")
      .eq("website", url)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.warn("Rate limit check failed:", error);
      return { allowed: true };
    }

    if (!data || data.length === 0) {
      return { allowed: true };
    }

    const testData = data[0] as { test_id: string; score: number; created_at: string };
    const lastTest = new Date(testData.created_at);
    const now = new Date();
    const daysSinceLastTest = Math.floor((now.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastTest < COOLDOWN_DAYS) {
      return {
        allowed: false,
        daysRemaining: COOLDOWN_DAYS - daysSinceLastTest,
        lastTestDate: lastTest.toISOString(),
        cachedTestId: testData.test_id,
        cachedScore: testData.score,
        cachedCreatedAt: testData.created_at,
      };
    }

    return { allowed: true };
  } catch (e) {
    console.warn("Rate limit check error:", e);
    return { allowed: true };
  }
};

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { email, website, testType }: TestSubmission = await req.json();

    if (!testType || !["homepage", "blog"].includes(testType)) {
      return new Response(JSON.stringify({ success: false, error: "testType must be 'homepage' or 'blog'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validatedEmail = validateEmail(email);
    const validatedWebsite = validateWebsite(website);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log(`[INIT] Supabase URL: ${supabaseUrl ? "SET" : "MISSING"}`);
    console.log(`[INIT] Supabase Key: ${supabaseKey ? "SET (length: " + supabaseKey.length + ")" : "MISSING"}`);

    if (!supabaseUrl || !supabaseKey) {
      console.error("[INIT] Missing Supabase credentials!");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

    // Blog posts have a 3 per 30 days limit (30-day rolling window)
    // Homepage tests are UNLIMITED (no IP rate limit for homepage)
    if (testType === "blog") {
      const BLOG_TESTS_LIMIT = 3;
      const ROLLING_WINDOW_DAYS = 30;
      const thirtyDaysAgo = new Date(Date.now() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

      const { data: recentBlogTests, error: blogCountError } = await supabaseAdmin
        .from("test_submissions")
        .select("created_at")
        .eq("ip_address", clientIP)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (blogCountError) {
        console.error("Blog rate limit check failed:", blogCountError);
      } else if (recentBlogTests && recentBlogTests.length >= BLOG_TESTS_LIMIT) {
        // Calculate reset date: 30 days from FIRST test in this window
        const firstTestDate = new Date(recentBlogTests[0].created_at);
        const resetDate = new Date(firstTestDate.getTime() + ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

        console.warn(`[rate-limit] IP ${clientIP} exceeded blog limit: ${recentBlogTests.length} posts in 30 days`);

        return createErrorResponse("RATE_LIMIT_IP", {
          user_message: `You've tested 3 blog posts in the last 7 days. You can test more on ${formatDateForUser(resetDate)} (IST). Homepage tests are unlimited!`,
          next_available_time: resetDate.toISOString(),
          suggested_action: "Test homepages (unlimited) or wait until reset date",
          technical_details: `IP: ${clientIP}, Blog posts in 30 days: ${recentBlogTests.length}`,
        });
      }

      const remaining = BLOG_TESTS_LIMIT - (recentBlogTests?.length || 0);
      console.log(`[rate-limit] IP ${clientIP} has ${remaining}/3 blog tests remaining`);
    } else {
      console.log(`[rate-limit] Homepage test for IP ${clientIP} - no limit applied`);
    }

    // Check URL cooldown (7 days) and return cached results if within cooldown
    const urlRateCheck = await checkRateLimitWithCache(supabaseAdmin, validatedWebsite);

    if (!urlRateCheck.allowed && urlRateCheck.cachedTestId) {
      const testDate = new Date(urlRateCheck.cachedCreatedAt!);
      const nextTestDate = new Date(testDate);
      nextTestDate.setDate(nextTestDate.getDate() + 7);

      console.log(`[rate-limit] URL ${validatedWebsite} in cooldown, returning cached results`);

      return createErrorResponse("RATE_LIMIT_URL", {
        user_message: `This URL was tested on ${formatDateForUser(testDate)} (IST). Same URL can be retested on ${formatDateForUser(nextTestDate)} (IST).`,
        next_available_time: nextTestDate.toISOString(),
        suggested_action: "We will show you the previous results. Made changes? Contact us for a priority retest.",
        cached_test_id: urlRateCheck.cachedTestId,
        cached_score: urlRateCheck.cachedScore,
        cached_created_at: urlRateCheck.cachedCreatedAt,
      });
    }

    const testId = crypto.randomUUID();
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const modelName = Deno.env.get("OPENAI_MODEL_NAME") || "gpt-4o-mini";

    console.log(`[${testId}] Starting analysis for ${testType}: ${validatedWebsite}`);

    let websiteHtml = "";
    let fetchSuccess = false;
    let fetchError: Error | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const websiteResponse = await fetch(validatedWebsite, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FoundIndex-Bot/1.0; +https://foundindex.com)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (websiteResponse.ok) {
        websiteHtml = await websiteResponse.text();
        fetchSuccess = true;
        console.log(`[${testId}] Fetched ${websiteHtml.length} chars`);
      } else {
        console.error(`[${testId}] Fetch failed with status: ${websiteResponse.status}`);
      }
    } catch (err) {
      fetchError = err instanceof Error ? err : new Error(String(err));
      console.error(`[${testId}] Fetch failed:`, fetchError);

      // Check for specific error types
      if (fetchError.name === "AbortError") {
        return createErrorResponse("TIMEOUT", {
          user_message:
            "The analysis took too long (over 30 seconds). This usually means the site is very slow or blocking access.",
          suggested_action: "Try again in a few minutes",
        });
      }
    }

    if (!fetchSuccess || websiteHtml.length < 100) {
      return createErrorResponse("SITE_UNREACHABLE", {
        user_message:
          "We could not connect to this website. Please check that the URL is correct and the site is online.",
        suggested_action: "Verify the URL and try again",
        technical_details: `Could not load content from ${validatedWebsite}. ${fetchError?.message || "The site may be blocking bots, temporarily down, or require login."}`,
      });
    }

    const spaMarkers = ['id="root"', 'id="app"', "__NEXT_DATA__", "window.__NUXT__"];
    const hasSPAMarker = spaMarkers.some((marker) => websiteHtml.includes(marker));

    let textContent = websiteHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    let isLikelyJSRendered = hasSPAMarker && textContent.length < 500;

    if (isLikelyJSRendered) {
      console.log(`[${testId}] JS-rendered detected, trying Jina.ai...`);
      try {
        const jinaResponse = await fetch(`https://r.jina.ai/${validatedWebsite}`, {
          headers: { Accept: "text/html" },
          signal: AbortSignal.timeout(30000),
        });

        if (jinaResponse.ok) {
          const rendered = await jinaResponse.text();
          if (rendered.length > textContent.length) {
            textContent = rendered;
            websiteHtml = `<!DOCTYPE html><html><body>${rendered}</body></html>`;
            isLikelyJSRendered = false;
            console.log(`[${testId}] Jina.ai rendered ${rendered.length} chars`);
          }
        }
      } catch (e) {
        console.warn(`[${testId}] Jina.ai failed:`, e);
      }
    }

    if (isLikelyJSRendered && textContent.length < 200) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Unable to analyze JavaScript-rendered website. Ensure your content is server-rendered for AI visibility.",
          testId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const detectedType = detectPageType(validatedWebsite, websiteHtml, testType);
    console.log(`[${testId}] Detected type: ${detectedType}, Requested: ${testType}`);

    const analysisType = detectedType;

    const schemaResult = parseSchemaMarkup(websiteHtml, analysisType);
    const semanticResult = analyzeSemanticHtml(websiteHtml, analysisType);
    const technicalResult = analyzeTechnical(validatedWebsite, websiteHtml);
    const imageResult = analyzeImages(websiteHtml, analysisType);

    const schemaWeight = analysisType === "homepage" ? 20 : 18;
    const semanticWeight = analysisType === "homepage" ? 12 : 14;
    const technicalWeight = 8;
    const imageWeight = analysisType === "homepage" ? 0 : 8;

    const schemaScore =
      schemaResult.maxScore > 0 ? (schemaResult.totalScore / schemaResult.maxScore) * schemaWeight : 0;
    const semanticScore = (semanticResult.score / semanticResult.maxScore) * semanticWeight;
    const technicalScore = (technicalResult.score / technicalResult.maxScore) * technicalWeight;
    const imageScore = (imageResult.score / imageResult.maxScore) * imageWeight;

    const deterministicTotal = Math.round((schemaScore + semanticScore + technicalScore + imageScore) * 10) / 10;

    console.log(
      `[${testId}] Deterministic: schema=${schemaScore.toFixed(1)}, semantic=${semanticScore.toFixed(1)}, technical=${technicalScore.toFixed(1)}, images=${imageScore.toFixed(1)}`,
    );

    const extractedContent = websiteHtml.substring(0, 50000);

    const analysisPrompt =
      analysisType === "homepage"
        ? `Analyze this business homepage for AI search visibility.

URL: ${validatedWebsite}
HTML: ${extractedContent}

Score these 3 categories (60 points total):

1. CONTENT CLARITY (max 25 points): Does the page clearly answer "what is this business, who is it for, what problem does it solve?"
2. ANSWER STRUCTURE (max 20 points): Are key answers front-loaded? Can AI extract the core value proposition in the first 200 words?
3. AUTHORITY SIGNALS (max 15 points): Credentials, testimonials, data, specific claims with evidence?

For each issue, provide:
- priority: "critical" | "medium" | "good"
- title: Short issue name (sentence case)
- pointsLost: Negative number
- problem: What's wrong
- howToFix: Array of specific steps
- codeExample: HTML snippet if applicable
- expectedImprovement: Point gain estimate

Return ONLY valid JSON:
{
  "categories": {
    "contentClarity": { "score": 18, "max": 25 },
    "answerStructure": { "score": 14, "max": 20 },
    "authoritySignals": { "score": 10, "max": 15 }
  },
  "recommendations": [...]
}`
        : `Analyze this blog post for AI search visibility.

URL: ${validatedWebsite}
HTML: ${extractedContent}

Score these 3 categories (60 points total):

1. ANSWER STRUCTURE (max 25 points): Does it answer the title question directly in the first 150 words? AI needs upfront answers.
2. SCANNABILITY (max 20 points): Clear subheadings every 300 words? Bullet points for lists? Short paragraphs?
3. EXPERTISE SIGNALS (max 15 points): Author credentials visible? Citations? Specific data? Original insights?

For each issue, provide:
- priority: "critical" | "medium" | "good"
- title: Short issue name (sentence case)
- pointsLost: Negative number
- problem: What's wrong
- howToFix: Array of specific steps
- codeExample: HTML snippet if applicable
- expectedImprovement: Point gain estimate

Return ONLY valid JSON:
{
  "categories": {
    "answerStructure": { "score": 18, "max": 25 },
    "scannability": { "score": 14, "max": 20 },
    "expertiseSignals": { "score": 10, "max": 15 }
  },
  "recommendations": [...]
}`;

    console.log(`[${testId}] Calling OpenAI for ${analysisType} analysis...`);

    let aiAnalysisResult: Record<string, unknown> = { categories: {}, recommendations: [] };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: analysisPrompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${testId}] OpenAI error:`, response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      aiAnalysisResult = JSON.parse(content);
      console.log(`[${testId}] AI analysis complete`);
    } catch (error) {
      console.error(`[${testId}] AI analysis failed:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Check for quota/rate limit errors
      if (errorMessage.includes("quota") || errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        return createErrorResponse("API_QUOTA", {
          user_message: "Our AI service is temporarily at capacity. Please try again in 2-4 hours.",
          suggested_action: "Try again later or contact us to get notified when it is back",
        });
      }

      return createErrorResponse("GENERAL_ERROR", {
        user_message: "AI analysis failed. Please try again.",
        suggested_action: "Try again in a few minutes",
      });
    }

    const aiCategories = (aiAnalysisResult.categories || {}) as Record<string, { score?: number; max?: number }>;
    const aiTotal = Object.values(aiCategories).reduce((sum: number, cat) => {
      if (cat && typeof cat === "object" && typeof cat.score === "number") {
        return sum + cat.score;
      }
      return sum;
    }, 0);

    const totalScore = Math.round(deterministicTotal + aiTotal);
    const grade = getGrade(totalScore);

    const displayCategories: Record<string, unknown> = {
      schemaMarkup: {
        score: Math.round(schemaScore * 10) / 10,
        max: schemaWeight,
        percentage: schemaWeight > 0 ? Math.round((schemaScore / schemaWeight) * 100) : 0,
        breakdown: schemaResult,
      },
      semanticStructure: {
        score: Math.round(semanticScore * 10) / 10,
        max: semanticWeight,
        percentage: Math.round((semanticScore / semanticWeight) * 100),
        details: semanticResult.details,
      },
      technicalFoundation: {
        score: Math.round(technicalScore * 10) / 10,
        max: technicalWeight,
        percentage: Math.round((technicalScore / technicalWeight) * 100),
        details: technicalResult.details,
      },
    };

    if (analysisType === "blog") {
      displayCategories.images = {
        score: Math.round(imageScore * 10) / 10,
        max: imageWeight,
        percentage: imageWeight > 0 ? Math.round((imageScore / imageWeight) * 100) : 0,
        details: imageResult.details,
      };
    }

    for (const [key, value] of Object.entries(aiCategories)) {
      if (value && typeof value === "object") {
        const catValue = value as { score?: number; max?: number };
        const catScore = catValue.score ?? 0;
        const catMax = catValue.max ?? 1;
        displayCategories[key] = {
          score: catScore,
          max: catMax,
          percentage: Math.round((catScore / catMax) * 100),
        };
      }
    }

    // FIXED: Filter out BlogPosting recommendations if Article exists
    const schemaRecommendations = schemaResult.scores
      .filter((s) => {
        // Don't create recommendations for schemas we intentionally skipped
        if (!s.found && analysisType === "blog" && s.category === "BlogPosting") {
          // Check if we have Article schema instead
          const hasArticle = schemaResult.schemas.some((schema) =>
            ["Article", "BlogPosting", "NewsArticle", "TechArticle"].includes(schema.type),
          );
          if (hasArticle) {
            console.log(`[recs-debug] Skipping BlogPosting recommendation - Article schema exists`);
            return false;
          }
        }
        return !s.found || s.missingFields.length > 0;
      })
      .slice(0, 3)
      .map((s, idx) => ({
        id: `schema-${idx}`,
        priority: s.found ? "medium" : "critical",
        title: s.found ? `Complete your ${s.category} schema` : `Add ${s.category} schema markup`,
        pointsLost: -Math.round((s.maxPoints - s.earnedPoints) * 10) / 10,
        problem: s.details,
        howToFix: s.found
          ? [`Add missing fields: ${s.missingFields.join(", ")}`]
          : [`Add ${s.category} schema to your page`, `Use JSON-LD format`, `Include: ${s.missingFields.join(", ")}`],
        codeExample: !s.found
          ? `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "${s.category}",\n  ${s.missingFields.map((f) => `"${f}": "..."`).join(",\n  ")}\n}\n</script>`
          : "",
        expectedImprovement: `+${Math.round((s.maxPoints - s.earnedPoints) * 10) / 10} points`,
      }));

    const aiRecommendations = Array.isArray(aiAnalysisResult.recommendations) ? aiAnalysisResult.recommendations : [];

    const allRecommendations = [...schemaRecommendations, ...aiRecommendations].map((rec, idx) => {
      const recObj = rec as Record<string, unknown>;
      return {
        id: (recObj.id as string) || `rec-${idx}`,
        priority: (recObj.priority as string) || "medium",
        title: (recObj.title as string) || "Recommendation",
        pointsLost: (recObj.pointsLost as number) || 0,
        problem: (recObj.problem as string) || "",
        howToFix: recObj.howToFix || [],
        codeExample: (recObj.codeExample as string) || "",
        expectedImprovement: (recObj.expectedImprovement as string) || "",
      };
    });

    allRecommendations.sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, medium: 1, good: 2 };
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    });

    let industryAverage = 58;
    try {
      const { data: avgData } = await supabaseAdmin
        .from("test_history")
        .select("score")
        .eq("test_type", analysisType)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (avgData && avgData.length > 5) {
        const scores = avgData.map((d: { score: number }) => d.score);
        industryAverage = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
      }
    } catch (e) {
      console.warn(`[${testId}] Could not calculate industry average:`, e);
    }

    console.log(`[${testId}] 📝 BEFORE DATABASE INSERT - About to save results to test_history table`);

    const insertData = {
      test_id: testId,
      website: validatedWebsite,
      test_type: testType,
      detected_type: detectedType,
      score: totalScore,
      grade,
      categories: displayCategories,
      recommendations: allRecommendations,
    };

    console.log(
      `[${testId}] Insert data: ${JSON.stringify({
        test_id: testId,
        website: validatedWebsite,
        test_type: testType,
        detected_type: detectedType,
        score: totalScore,
        grade,
        categories_count: Object.keys(displayCategories).length,
        recommendations_count: allRecommendations.length,
      })}`,
    );

    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from("test_history")
      .insert(insertData)
      .select();

    console.log(`[${testId}] 📊 AFTER DATABASE INSERT ATTEMPT`);

    if (insertError) {
      console.error(`[${testId}] ❌ DATABASE ERROR:`, insertError.message);
      console.error(`[${testId}] Full error:`, JSON.stringify(insertError, null, 2));
    } else {
      console.log(`[${testId}] ✅ SAVED TO DATABASE: ${insertResult?.[0]?.id}`);
      console.log(`[${testId}] Full insert result: ${JSON.stringify(insertResult, null, 2)}`);
    }

    await supabaseAdmin.from("test_submissions").insert({
      email: validatedEmail,
      ip_address: clientIP,
      test_id: testId,
      created_at: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    console.log(`[${testId}] SUCCESS - Score: ${totalScore}, Grade: ${grade}, Duration: ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        testId,
        score: totalScore,
        grade,
        detectedType,
        requestedType: testType,
        categories: displayCategories,
        recommendations: allRecommendations,
        industryAverage,
        criteriaCount: analysisType === "homepage" ? 47 : 52,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("FATAL ERROR:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
