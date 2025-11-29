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
// SCHEMA.ORG PARSER
// =============================================================================

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
        if (!(field in properties) || properties[field] === null || properties[field] === undefined) {
          errors.push(`Missing required field: ${field}`);
          isValid = false;
        }
      }
    }

    schemaItems.push({ type, properties, isValid, errors });

    // Process nested objects
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

  const matchingItems = items.filter((item) => item.type === type);

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
    const presentCount = allFields.filter((f) => f in item.properties).length;
    if (presentCount > bestFieldCount) {
      bestFieldCount = presentCount;
      bestItem = item;
    }
  }

  const missingRequired = requirements.required.filter((f) => !(f in bestItem.properties));

  const requiredScore =
    requirements.required.length > 0
      ? ((requirements.required.length - missingRequired.length) / requirements.required.length) * 0.6
      : 0.6;

  const presentRecommended = requirements.recommended.filter((f) => f in bestItem.properties).length;
  const recommendedScore =
    requirements.recommended.length > 0 ? (presentRecommended / requirements.recommended.length) * 0.4 : 0.4;

  const totalPercentage = requiredScore + recommendedScore;
  const earnedPoints = Math.round(requirements.points * totalPercentage * 10) / 10;

  let details = `Found ${matchingItems.length} ${type} schema(s). `;
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

  const schemasToScore =
    pageType === "homepage"
      ? ["Organization", "WebSite", "WebPage", "FAQPage", "BreadcrumbList", "ContactPoint", "LocalBusiness", "Product"]
      : ["Article", "BlogPosting", "FAQPage", "BreadcrumbList", "WebPage"];

  const scores: SchemaScore[] = [];

  for (const schemaType of schemasToScore) {
    if (schemaType === "Article") {
      const hasBlogPosting = allSchemas.some((s) => s.type === "BlogPosting");
      if (hasBlogPosting) continue;
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

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: { totalImages, withAltText, withDescriptiveAlt },
  };
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
  normalized = normalized.replace(/\/+$/, "");
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  return normalized;
};

const validateWebsite = (website: string): string => {
  const trimmed = website.trim();
  if (!trimmed) throw new Error("Please enter a website URL");
  const normalized = normalizeUrl(trimmed);
  if (normalized.includes(".")) return normalized;
  throw new Error('Please enter a valid website URL (like "example.com")');
};

// IMPROVED: Better page type detection that respects user selection
const detectPageType = (url: string, html: string, requestedType: "homepage" | "blog"): "homepage" | "blog" => {
  const urlLower = url.toLowerCase();

  // Strong blog indicators in URL
  const blogPatterns = ["/blog/", "/post/", "/article/", "/news/", "/insights/", "/stories/", "/journal/"];
  const hasBlogUrl = blogPatterns.some((pattern) => urlLower.includes(pattern));
  const datePattern = /\/\d{4}\/\d{2}\//;
  const hasDateUrl = datePattern.test(urlLower);
  const hasBlogSubdomain = /^https?:\/\/blog\./i.test(url);

  // Strong blog indicators in HTML
  const hasBlogHTML =
    html.includes('"@type":"BlogPosting"') ||
    html.includes('"@type":"Article"') ||
    html.includes('"@type": "BlogPosting"') ||
    html.includes('"@type": "Article"');

  // If URL or HTML strongly indicates blog, return blog
  if (hasBlogUrl || hasDateUrl || hasBlogSubdomain || hasBlogHTML) {
    return "blog";
  }

  // Otherwise trust the user's selection
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
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const testId = crypto.randomUUID();
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    // Use gpt-4o-mini for cost savings (~15x cheaper than gpt-4o)
    const modelName = Deno.env.get("OPENAI_MODEL_NAME") || "gpt-4o-mini";

    console.log(`[${testId}] Starting analysis for ${testType}: ${validatedWebsite}`);

    // Fetch website
    let websiteHtml = "";
    let fetchSuccess = false;

    try {
      const websiteResponse = await fetch(validatedWebsite, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FoundIndex-Bot/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });

      if (websiteResponse.ok) {
        websiteHtml = await websiteResponse.text();
        fetchSuccess = true;
        console.log(`[${testId}] Fetched ${websiteHtml.length} chars`);
      }
    } catch (fetchError) {
      console.error(`[${testId}] Fetch failed:`, fetchError);
    }

    if (!fetchSuccess || websiteHtml.length < 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to access this website",
          details: `Could not load content from ${validatedWebsite}. The site may be blocking bots, temporarily down, or require login.`,
          testId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Handle JS-rendered content
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

    // FIXED: Pass requestedType to detection function
    const detectedType = detectPageType(validatedWebsite, websiteHtml, testType);
    console.log(`[${testId}] Detected type: ${detectedType}, Requested: ${testType}`);

    // ==========================================================================
    // DETERMINISTIC SCORING (40 points)
    // ==========================================================================

    const schemaResult = parseSchemaMarkup(websiteHtml, testType);
    const semanticResult = analyzeSemanticHtml(websiteHtml, testType);
    const technicalResult = analyzeTechnical(validatedWebsite, websiteHtml);
    const imageResult = analyzeImages(websiteHtml, testType);

    const schemaWeight = testType === "homepage" ? 20 : 18;
    const semanticWeight = testType === "homepage" ? 12 : 14;
    const technicalWeight = 8;
    const imageWeight = testType === "homepage" ? 0 : 8;

    const schemaScore =
      schemaResult.maxScore > 0 ? (schemaResult.totalScore / schemaResult.maxScore) * schemaWeight : 0;
    const semanticScore = (semanticResult.score / semanticResult.maxScore) * semanticWeight;
    const technicalScore = (technicalResult.score / technicalResult.maxScore) * technicalWeight;
    const imageScore = (imageResult.score / imageResult.maxScore) * imageWeight;

    const deterministicTotal = Math.round((schemaScore + semanticScore + technicalScore + imageScore) * 10) / 10;
    const deterministicMax = schemaWeight + semanticWeight + technicalWeight + imageWeight;

    console.log(
      `[${testId}] Deterministic scores: schema=${schemaScore.toFixed(1)}, semantic=${semanticScore.toFixed(1)}, technical=${technicalScore.toFixed(1)}, images=${imageScore.toFixed(1)}, total=${deterministicTotal}/${deterministicMax}`,
    );

    // ==========================================================================
    // AI ANALYSIS (60 points)
    // ==========================================================================

    const extractedContent = websiteHtml.substring(0, 50000);

    const analysisPrompt =
      testType === "homepage"
        ? `Analyze this business homepage for AI search visibility.

URL: ${validatedWebsite}
HTML: ${extractedContent}

Score these 3 categories (60 points total):

1. CONTENT CLARITY (max 25 points): Does the page clearly answer "what is this business, who is it for, what problem does it solve?"
2. ANSWER STRUCTURE (max 20 points): Are key answers front-loaded? Can AI extract the core value proposition in the first 200 words?
3. AUTHORITY SIGNALS (max 15 points): Credentials, testimonials, data, specific claims with evidence?

For each issue, provide:
- priority: "critical" | "medium" | "good"
- title: Short issue name (sentence case, not title case)
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
- title: Short issue name (sentence case, not title case)
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

    console.log(`[${testId}] Calling OpenAI...`);

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
      return new Response(
        JSON.stringify({
          success: false,
          error: "AI analysis failed. Please try again.",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ==========================================================================
    // COMBINE SCORES
    // ==========================================================================

    const aiCategories = (aiAnalysisResult.categories || {}) as Record<string, { score?: number; max?: number }>;
    const aiTotal = Object.values(aiCategories).reduce((sum: number, cat) => {
      if (cat && typeof cat === "object" && typeof cat.score === "number") {
        return sum + cat.score;
      }
      return sum;
    }, 0);

    const totalScore = Math.round(deterministicTotal + aiTotal);
    const grade = getGrade(totalScore);

    // Build combined categories for display - FIXED: No spread on unknown types
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

    if (testType === "blog") {
      displayCategories.images = {
        score: Math.round(imageScore * 10) / 10,
        max: imageWeight,
        percentage: imageWeight > 0 ? Math.round((imageScore / imageWeight) * 100) : 0,
        details: imageResult.details,
      };
    }

    // Add AI categories - FIXED: Properly typed iteration
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

    // Generate schema recommendations
    const schemaRecommendations = schemaResult.scores
      .filter((s) => !s.found || s.missingFields.length > 0)
      .slice(0, 3)
      .map((s, idx) => ({
        id: `schema-${idx}`,
        priority: s.found ? "medium" : "critical",
        title: s.found ? `Complete your ${s.category} schema` : `Add ${s.category} schema markup`,
        pointsLost: -Math.round((s.maxPoints - s.earnedPoints) * 10) / 10,
        problem: s.details,
        howToFix: s.found
          ? [`Add missing fields: ${s.missingFields.join(", ")}`]
          : [
              `Add ${s.category} schema to your page`,
              `Use JSON-LD format in a script tag`,
              `Include required fields: ${s.missingFields.join(", ")}`,
            ],
        codeExample: !s.found
          ? `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "${s.category}",
  ${s.missingFields.map((f) => `"${f}": "..."`).join(",\n  ")}
}
</script>`
          : "",
        expectedImprovement: `+${Math.round((s.maxPoints - s.earnedPoints) * 10) / 10} points`,
      }));

    // Get AI recommendations safely
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

    // Sort by priority
    allRecommendations.sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, medium: 1, good: 2 };
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (a.pointsLost || 0) - (b.pointsLost || 0);
    });

    // Calculate dynamic industry average from database
    let industryAverage = 58;
    try {
      const { data: avgData } = await supabaseAdmin
        .from("test_history")
        .select("score")
        .eq("test_type", testType)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (avgData && avgData.length > 5) {
        const scores = avgData.map((d: { score: number }) => d.score);
        industryAverage = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
      }
    } catch (e) {
      console.warn(`[${testId}] Could not calculate industry average:`, e);
    }

    // Save to database - USING CORRECT TABLE NAME: test_history
    try {
      await supabaseAdmin.from("test_history").insert({
        test_id: testId,
        website: validatedWebsite,
        test_type: testType,
        detected_type: detectedType,
        score: totalScore,
        grade,
        categories: displayCategories,
        recommendations: allRecommendations,
      });
      console.log(`[${testId}] Saved to database`);
    } catch (historyError) {
      console.error(`[${testId}] Database save failed:`, historyError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to save results. Please contact support.",
          details: historyError instanceof Error ? historyError.message : "Database error",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const responseData = {
      success: true,
      testId,
      score: totalScore,
      grade,
      detectedType,
      requestedType: testType,
      categories: displayCategories,
      recommendations: allRecommendations,
      industryAverage,
      criteriaCount: testType === "homepage" ? 47 : 52,
    };

    console.log(`[${testId}] SUCCESS - Score: ${totalScore}, Grade: ${grade}`);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
