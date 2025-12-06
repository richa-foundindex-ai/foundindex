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
    required: ["name", "url"],
    recommended: ["logo", "description", "sameAs", "contactPoint", "address"],
    points: 8,
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
    points: 3,
  },
  ContactPoint: {
    required: ["contactType"],
    recommended: ["telephone", "email", "areaServed"],
    points: 3,
  },
  WebSite: {
    required: ["name", "url"],
    recommended: ["potentialAction", "description"],
    points: 2,
  },
  WebPage: {
    required: ["name"],
    recommended: ["description", "url", "breadcrumb"],
    points: 1,
  },
  Product: {
    required: ["name", "description"],
    recommended: ["brand", "offers", "image", "sku"],
    points: 6,
  },
  LocalBusiness: {
    required: ["name", "address"],
    recommended: ["telephone", "openingHours", "geo", "priceRange"],
    points: 7,
  },
  Service: {
    required: ["name", "description"],
    recommended: ["provider", "areaServed", "serviceType"],
    points: 6,
  },
  Person: {
    required: ["name"],
    recommended: ["url", "image", "jobTitle", "sameAs"],
    points: 4,
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

  console.log(`[schema-debug] Found ${allSchemas.length} total schemas: ${allSchemas.map(s => s.type).join(", ")}`);

  const schemasToScore =
    pageType === "homepage"
      ? ["Organization", "WebSite", "WebPage", "FAQPage", "BreadcrumbList", "ContactPoint", "LocalBusiness", "Product"]
      : ["Article", "BlogPosting", "FAQPage", "BreadcrumbList", "WebPage"];

  const scores: SchemaScore[] = [];

  for (const schemaType of schemasToScore) {
    // FIXED: For blogs, if we have Article schema, don't penalize for missing BlogPosting
    if (schemaType === "BlogPosting" && pageType === "blog") {
      const hasArticle = allSchemas.some((s) => 
        ["Article", "BlogPosting", "NewsArticle", "TechArticle"].includes(s.type)
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
  const checks = {
    hasArticleTag: /<article[\s>]/i.test(html),
    hasSectionTags: /<section[\s>]/i.test(html),
    hasNavTag: /<nav[\s>]/i.test(html),
    hasAsideTag: /<aside[\s>]/i.test(html),
    hasFigureTags: /<figure[\s>]/i.test(html),
    hasHeaderFooter: /<header[\s>]/i.test(html) && /<footer[\s>]/i.test(html),
    hasMain: /<main[\s>]/i.test(html),
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
        }
      : {
          hasArticleTag: 4,
          hasSectionTags: 3,
          hasNavTag: 2,
          hasAsideTag: 2,
          hasFigureTags: 3,
          hasHeaderFooter: 2,
          hasMain: 2,
        };

  const maxScore = pageType === "homepage" ? 17 : 18;
  let score = 0;

  for (const [key, passed] of Object.entries(checks)) {
    if (passed) {
      score += weights[key as keyof typeof weights] || 0;
    }
  }

  return { score: Math.min(score, maxScore), maxScore, details: checks };
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
// RATE LIMITING
// =============================================================================

const checkRateLimit = async (
  supabase: any,
  url: string,
  testType: "homepage" | "blog",
): Promise<{ allowed: boolean; daysRemaining?: number; lastTestDate?: string }> => {
  const COOLDOWN_DAYS = 7;

  try {
    const { data, error } = await supabase
      .from("test_history")
      .select("created_at")
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

    const lastTest = new Date((data[0] as any).created_at);
    const now = new Date();
    const daysSinceLastTest = Math.floor((now.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastTest < COOLDOWN_DAYS) {
      return {
        allowed: false,
        daysRemaining: COOLDOWN_DAYS - daysSinceLastTest,
        lastTestDate: lastTest.toISOString().split("T")[0],
      };
    }

    return { allowed: true };
  } catch (e) {
    console.warn("Rate limit check error:", e);
    return { allowed: true };
  }
};

// =============================================================================
// MAIN HANDLER (REST OF THE CODE STAYS THE SAME)
// =============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try