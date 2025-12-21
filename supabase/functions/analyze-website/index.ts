// supabase/functions/analyze-website/index.ts
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

// AI Interpretation types
interface AIInterpretation {
  interpretation: string;
  industry: string;
  audience: string;
  problem: string;
  solution: string;
  confidenceScore: number;
  confidenceBreakdown: {
    hasAudience: boolean;
    hasProblem: boolean;
    hasSolution: boolean;
    isSpecific: boolean;
  };
}

interface ErrorResponse {
  success: false;
  error_type: ErrorType;
  error_code?: string;
  user_message: string;
  next_available_time?: string;
  suggested_action?: string;
  technical_details?: string;
  cached_test_id?: string;
  cached_score?: number;
  cached_created_at?: string;
  test_id?: string;
  testedAt?: string;
  canRetestAt?: string;
  attempts_exhausted?: boolean;
}

interface TestSubmission {
  website: string;
  testType: "homepage" | "blog";
  email?: string;
}

interface SchemaScore {
  category: string;
  found: boolean;
  earnedPoints: number;
  maxPoints: number;
  missingFields: string[];
  details: string;
}

interface AIVisibility {
  google: boolean;
  perplexity: boolean;
  chatgpt: boolean;
  feedReaders: boolean;
}

interface SchemaResult {
  totalScore: number;
  maxScore: number;
  scores: SchemaScore[];
  schemas: { type: string; data: Record<string, unknown> }[];
  schemaLocation?: "none" | "static" | "javascript" | "both";
  aiVisibility?: AIVisibility;
}

interface AnalysisResult {
  score: number;
  maxScore: number;
  details: string[];
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

const validateEmail = (email: string | undefined): string => {
  if (!email) return "";
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : "";
};

const validateWebsite = (website: string): string => {
  if (!website) throw new Error("Website URL is required");

  let url = website.trim();

  // Add https:// if no protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    throw new Error("Invalid website URL");
  }
};

// =============================================================================
// PAGE TYPE DETECTION
// =============================================================================

const detectPageType = (
  url: string,
  html: string,
  requestedType: "homepage" | "blog"
): "homepage" | "blog" => {
  const urlLower = url.toLowerCase();
  const htmlLower = html.toLowerCase();

  // Check for blog indicators in URL
  const blogUrlPatterns = [
    "/blog/",
    "/post/",
    "/article/",
    "/news/",
    "/posts/",
    "/articles/",
  ];
  const hasBlogUrl = blogUrlPatterns.some((p) => urlLower.includes(p));

  // Check for blog indicators in HTML
  const blogHtmlPatterns = [
    'type="article"',
    "blogposting",
    "newsarticle",
    "article:published",
    'class="post"',
    'class="article"',
    'class="blog-post"',
  ];
  const hasBlogHtml = blogHtmlPatterns.some((p) => htmlLower.includes(p));

  // Check for homepage indicators
  const isRootPath =
    new URL(url).pathname === "/" || new URL(url).pathname === "";

  if (isRootPath && requestedType === "homepage") {
    return "homepage";
  }

  if (hasBlogUrl || hasBlogHtml) {
    return "blog";
  }

  return requestedType;
};

// =============================================================================
// GRADE HELPER
// =============================================================================

const getGrade = (score: number): string => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

// =============================================================================
// SCHEMA MARKUP PARSING
// =============================================================================

const extractJsonLd = (html: string): Record<string, unknown>[] => {
  const schemas: Record<string, unknown>[] = [];
  const regex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const content = match[1].trim();
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        schemas.push(...parsed);
      } else if (parsed["@graph"]) {
        schemas.push(...(parsed["@graph"] as Record<string, unknown>[]));
      } else {
        schemas.push(parsed);
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }

  return schemas;
};

const parseSchemaMarkup = (
  html: string,
  pageType: "homepage" | "blog"
): SchemaResult => {
  return parseSchemaMarkupWithLocation(html, pageType, "static");
};

const parseSchemaMarkupWithLocation = (
  html: string,
  pageType: "homepage" | "blog",
  detectedLocation: "none" | "static" | "javascript" | "both"
): SchemaResult => {
  const schemas = extractJsonLd(html);
  const scores: SchemaScore[] = [];

  const schemaTypes = schemas.map((s) => ({
    type: (s["@type"] as string) || "Unknown",
    data: s,
  }));

  // NEW SCORING LOGIC: Give credit for ANY valid schema found
  const maxScore = 20;
  let totalScore = 0;

  // Check if ANY schema exists (base points)
  const hasAnySchema = schemas.length > 0;
  
  // Use the detected location passed in, or determine from schema presence
  let schemaLocation: "none" | "static" | "javascript" | "both" = detectedLocation;
  if (detectedLocation === "none" && hasAnySchema) {
    schemaLocation = "static"; // If we found schemas and location was 'none', they're in static HTML
  } else if (!hasAnySchema) {
    schemaLocation = "none";
  }
  
  console.log(`[parseSchemaMarkup] Found ${schemas.length} schemas, location: ${schemaLocation}`);
  
  if (!hasAnySchema) {
    // No schema at all = 0/20
    scores.push({
      category: "SchemaPresence",
      found: false,
      earnedPoints: 0,
      maxPoints: 20,
      missingFields: ["No structured data found"],
      details: "No JSON-LD schema markup detected. Add schema.org structured data.",
    });
    
    return {
      totalScore: 0,
      maxScore,
      scores,
      schemas: schemaTypes,
      schemaLocation: "none",
      aiVisibility: {
        google: false,
        perplexity: false,
        chatgpt: false,
        feedReaders: false,
      },
    };
  }

  // Score based on schema location
  // Static HTML: 18/20 base (visible to all AI systems)
  // JavaScript only: 10/20 (visible to some)
  // Both: 18/20 (visible to all)
  if (schemaLocation === "static" || schemaLocation === "both") {
    totalScore = 18; // High score for static/both
  } else if (schemaLocation === "javascript") {
    totalScore = 10; // Partial score for JS-only
  }

  // Define required schemas based on page type for quality bonus
  const requiredSchemas =
    pageType === "homepage"
      ? [
          {
            type: "Organization",
            bonusPoints: 1,
            requiredFields: ["name", "url", "logo"],
          },
          {
            type: "WebSite",
            bonusPoints: 0.5,
            requiredFields: ["name", "url"],
          },
          {
            type: "WebPage",
            bonusPoints: 0.5,
            requiredFields: ["name", "description"],
          },
        ]
      : [
          {
            type: "BlogPosting",
            bonusPoints: 1,
            requiredFields: ["headline", "datePublished", "author"],
            alternativeTypes: ["Article", "NewsArticle", "TechArticle"],
          },
          {
            type: "BreadcrumbList",
            bonusPoints: 0.5,
            requiredFields: ["itemListElement"],
          },
          {
            type: "Author",
            bonusPoints: 0.5,
            requiredFields: ["name"],
            alternativeTypes: ["Person"],
          },
        ];

  // Check for required schemas and add bonus points (up to 2 more points)
  for (const required of requiredSchemas) {
    const alternativeTypes = (required as { alternativeTypes?: string[] })
      .alternativeTypes || [required.type];
    const allTypes = [required.type, ...alternativeTypes];

    const foundSchema = schemas.find((s) => {
      const schemaType = s["@type"];
      if (Array.isArray(schemaType)) {
        return schemaType.some((t) => allTypes.includes(t));
      }
      return allTypes.includes(schemaType as string);
    });

    if (foundSchema) {
      const missingFields = required.requiredFields.filter(
        (f) => !foundSchema[f]
      );
      const completeness = 1 - missingFields.length / required.requiredFields.length;
      const earnedBonus = required.bonusPoints * completeness;
      totalScore = Math.min(maxScore, totalScore + earnedBonus);

      scores.push({
        category: required.type,
        found: true,
        earnedPoints: earnedBonus,
        maxPoints: required.bonusPoints,
        missingFields,
        details:
          missingFields.length > 0
            ? `${required.type} found but missing: ${missingFields.join(", ")}`
            : `${required.type} complete`,
      });
    } else {
      scores.push({
        category: required.type,
        found: false,
        earnedPoints: 0,
        maxPoints: required.bonusPoints,
        missingFields: required.requiredFields,
        details: `${required.type} schema not found (optional bonus)`,
      });
    }
  }

  // Add summary score
  scores.unshift({
    category: "SchemaPresence",
    found: true,
    earnedPoints: Math.round(totalScore * 10) / 10,
    maxPoints: maxScore,
    missingFields: [],
    details: schemaLocation === "static" 
      ? "✓ Schema in static HTML - visible to all AI systems"
      : schemaLocation === "javascript"
      ? "⚠ Schema only in JavaScript - some AI systems cannot read it"
      : "✓ Schema in both static HTML and JavaScript",
  });

  // AI visibility based on schema location
  const isStaticOrBoth = schemaLocation === "static" || schemaLocation === "both";
  const aiVisibility: AIVisibility = {
    google: true, // Google executes JavaScript
    perplexity: true, // Perplexity executes JavaScript
    chatgpt: isStaticOrBoth, // ChatGPT has limited JS support
    feedReaders: isStaticOrBoth, // Feed readers need static HTML
  };

  return {
    totalScore: Math.round(totalScore * 10) / 10,
    maxScore,
    scores,
    schemas: schemaTypes,
    schemaLocation,
    aiVisibility,
  };
};

// =============================================================================
// SEMANTIC HTML ANALYSIS
// =============================================================================

const analyzeSemanticHtml = (
  html: string,
  pageType: "homepage" | "blog",
  renderedContent?: string // Optional: Jina.ai rendered markdown for JS sites
): AnalysisResult & { breakdown: { hasH1: boolean; hasHierarchy: boolean; hasSemanticTags: boolean; hasListStructure: boolean; missingTags: string[]; isJSRendered: boolean } } => {
  const details: string[] = [];
  let score = 0;
  const maxScore = 12; // 3 points each for 4 criteria

  // Track what's found for detailed display
  const breakdown = {
    hasH1: false,
    hasHierarchy: false,
    hasSemanticTags: false,
    hasListStructure: false,
    missingTags: [] as string[],
    isJSRendered: false,
  };

  // Check if this is a JS-rendered site (minimal static HTML but has rendered content)
  const staticTextContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  const isJSRendered = staticTextContent.length < 500 && !!renderedContent && renderedContent.length > 500;
  breakdown.isJSRendered = isJSRendered;

  if (isJSRendered && renderedContent) {
    // For JS-rendered sites, analyze the Jina.ai markdown output
    console.log(`[semantic] Analyzing JS-rendered site via markdown (${renderedContent.length} chars)`);
    
    // 1. Check for H1 in markdown (=== underline or # prefix)
    const hasMarkdownH1 = /^.+\n={3,}/m.test(renderedContent) || /^# [^\n]+/m.test(renderedContent);
    if (hasMarkdownH1) {
      score += 3;
      breakdown.hasH1 = true;
      details.push("✓ H1 heading present (in rendered content)");
    } else {
      details.push("✗ No H1 heading found");
    }

    // 2. Check for heading hierarchy in markdown (## or ---)
    const hasMarkdownH2 = /^.+\n-{3,}/m.test(renderedContent) || /^## [^\n]+/m.test(renderedContent);
    const hasMarkdownH3 = /^### [^\n]+/m.test(renderedContent);
    if (hasMarkdownH2 && hasMarkdownH3) {
      score += 3;
      breakdown.hasHierarchy = true;
      details.push("✓ Heading hierarchy (H1→H2→H3) in rendered content");
    } else if (hasMarkdownH2 || hasMarkdownH3) {
      score += 1.5;
      breakdown.hasHierarchy = true;
      details.push("⚠ Partial heading hierarchy in rendered content");
    } else {
      details.push("✗ No heading hierarchy found");
    }

    // 3. For JS sites, semantic tags exist in the virtual DOM - give credit if content is well-structured
    // Check if there are multiple sections/headers indicating good structure
    const sectionCount = (renderedContent.match(/^#{1,3} /gm) || []).length + 
                         (renderedContent.match(/^.+\n[=-]{3,}/gm) || []).length;
    if (sectionCount >= 4) {
      score += 3;
      breakdown.hasSemanticTags = true;
      details.push("✓ Well-structured content (multiple sections)");
    } else if (sectionCount >= 2) {
      score += 1.5;
      breakdown.hasSemanticTags = true;
      details.push("⚠ Some content structure present");
    } else {
      breakdown.missingTags = ["Content needs more structure"];
      details.push("✗ Content lacks clear structure");
    }

    // 4. Check for list structure in markdown
    const hasLists = /^[-*•] /m.test(renderedContent) || /^\d+\. /m.test(renderedContent) || /^\|.*\|/m.test(renderedContent);
    if (hasLists) {
      score += 3;
      breakdown.hasListStructure = true;
      details.push("✓ List/table structure present");
    } else {
      details.push("✗ No list structure found");
    }

    // Add note about JS rendering
    details.push("ℹ️ This is a JavaScript-rendered site - structure detected from rendered content");
    
  } else {
    // Standard HTML analysis for static sites
    
    // 1. Check for H1 tag (3 points)
    const h1Count = (html.match(/<h1/gi) || []).length;
    if (h1Count >= 1) {
      score += 3;
      breakdown.hasH1 = true;
      details.push(h1Count === 1 ? "✓ H1 heading present" : `✓ H1 heading present (${h1Count} found)`);
    } else {
      details.push("✗ No H1 heading found");
    }

    // 2. Check for heading hierarchy (3 points)
    const hasH2 = /<h2/i.test(html);
    const hasH3 = /<h3/i.test(html);
    if (hasH2 && hasH3) {
      score += 3;
      breakdown.hasHierarchy = true;
      details.push("✓ Heading hierarchy (H1→H2→H3)");
    } else if (hasH2 || hasH3) {
      score += 1.5;
      breakdown.hasHierarchy = true;
      details.push("⚠ Partial heading hierarchy");
    } else {
      details.push("✗ No heading hierarchy found");
    }

    // 3. Check for semantic tags (3 points)
    const semanticTags = [
      { tag: "header", found: /<header/i.test(html) },
      { tag: "nav", found: /<nav/i.test(html) },
      { tag: "main", found: /<main/i.test(html) },
      { tag: "article", found: /<article/i.test(html) },
      { tag: "section", found: /<section/i.test(html) },
      { tag: "footer", found: /<footer/i.test(html) },
    ];
    
    const foundSemanticCount = semanticTags.filter(t => t.found).length;
    const missingSemanticTags = semanticTags.filter(t => !t.found).map(t => `<${t.tag}>`);
    
    if (foundSemanticCount >= 4) {
      score += 3;
      breakdown.hasSemanticTags = true;
      details.push("✓ Semantic HTML tags present");
    } else if (foundSemanticCount >= 2) {
      score += 1.5;
      breakdown.hasSemanticTags = true;
      breakdown.missingTags = missingSemanticTags;
      details.push(`⚠ Some semantic tags (missing: ${missingSemanticTags.slice(0, 3).join(", ")})`);
    } else {
      breakdown.missingTags = missingSemanticTags;
      details.push("✗ Missing semantic HTML structure");
    }

    // 4. Check for list structure (3 points)
    const hasUl = /<ul/i.test(html);
    const hasOl = /<ol/i.test(html);
    if (hasUl || hasOl) {
      score += 3;
      breakdown.hasListStructure = true;
      details.push("✓ List structure present");
    } else {
      details.push("✗ No list structure found");
    }
  }

  return { 
    score: Math.round(score * 10) / 10, 
    maxScore, 
    details,
    breakdown,
  };
};

// =============================================================================
// TECHNICAL ANALYSIS
// =============================================================================

const analyzeTechnical = (url: string, html: string): AnalysisResult => {
  const details: string[] = [];
  let score = 0;
  const maxScore = 8;

  // Check for HTTPS
  if (url.startsWith("https://")) {
    score += 2;
    details.push("✓ HTTPS enabled");
  } else {
    details.push("✗ Not using HTTPS");
  }

  // Check for meta viewport
  if (/<meta[^>]*name\s*=\s*["']viewport["']/i.test(html)) {
    score += 1;
    details.push("✓ Viewport meta tag present");
  } else {
    details.push("✗ Viewport meta tag missing");
  }

  // Check for meta description
  if (/<meta[^>]*name\s*=\s*["']description["']/i.test(html)) {
    score += 1;
    details.push("✓ Meta description present");
  } else {
    details.push("✗ Meta description missing");
  }

  // Check for title tag
  if (/<title[^>]*>[\s\S]+<\/title>/i.test(html)) {
    score += 1;
    details.push("✓ Title tag present");
  } else {
    details.push("✗ Title tag missing");
  }

  // Check for canonical URL
  if (/<link[^>]*rel\s*=\s*["']canonical["']/i.test(html)) {
    score += 1;
    details.push("✓ Canonical URL present");
  } else {
    details.push("✗ Canonical URL missing");
  }

  // Check for Open Graph tags
  if (/<meta[^>]*property\s*=\s*["']og:/i.test(html)) {
    score += 1;
    details.push("✓ Open Graph tags present");
  } else {
    details.push("✗ Open Graph tags missing");
  }

  // Check for language attribute
  if (/<html[^>]*lang\s*=/i.test(html)) {
    score += 1;
    details.push("✓ HTML lang attribute present");
  } else {
    details.push("✗ HTML lang attribute missing");
  }

  return { score: Math.min(score, maxScore), maxScore, details };
};

// =============================================================================
// IMAGE ANALYSIS
// =============================================================================

const analyzeImages = (
  html: string,
  pageType: "homepage" | "blog"
): AnalysisResult => {
  const details: string[] = [];
  let score = 0;
  const maxScore = pageType === "blog" ? 8 : 0;

  if (pageType !== "blog") {
    return { score: 0, maxScore: 0, details: ["Image analysis N/A for homepage"] };
  }

  // Count images
  const imgTags = html.match(/<img[^>]*>/gi) || [];
  const totalImages = imgTags.length;

  if (totalImages === 0) {
    details.push("⚠ No images found in content");
    return { score: 0, maxScore, details };
  }

  // Check for alt attributes
  let imagesWithAlt = 0;
  let imagesWithDescriptiveAlt = 0;

  for (const img of imgTags) {
    const altMatch = img.match(/alt\s*=\s*["']([^"']*)["']/i);
    if (altMatch) {
      imagesWithAlt++;
      if (altMatch[1].length > 10) {
        imagesWithDescriptiveAlt++;
      }
    }
  }

  const altPercentage = (imagesWithAlt / totalImages) * 100;
  const descriptiveAltPercentage = (imagesWithDescriptiveAlt / totalImages) * 100;

  if (altPercentage === 100) {
    score += 4;
    details.push("✓ All images have alt attributes");
  } else if (altPercentage >= 75) {
    score += 2;
    details.push(`⚠ ${Math.round(altPercentage)}% of images have alt attributes`);
  } else {
    details.push(`✗ Only ${Math.round(altPercentage)}% of images have alt attributes`);
  }

  if (descriptiveAltPercentage >= 75) {
    score += 4;
    details.push("✓ Most alt texts are descriptive");
  } else if (descriptiveAltPercentage >= 50) {
    score += 2;
    details.push("⚠ Some alt texts could be more descriptive");
  } else {
    details.push("✗ Alt texts are too short or missing");
  }

  return { score: Math.min(score, maxScore), maxScore, details };
};

// =============================================================================
// AI INTERPRETATION ANALYSIS
// =============================================================================

const analyzeAIInterpretation = async (
  html: string,
  url: string,
  openaiApiKey: string,
  modelName: string
): Promise<AIInterpretation | null> => {
  // Extract key content areas: title, meta description, H1, first paragraph, value proposition
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : "";
  
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, "").trim() : "";
  
  // Extract first meaningful paragraph (skip navigation, headers)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  
  // Remove scripts, styles, nav, header, footer for cleaner text extraction
  let cleanContent = bodyContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");
  
  // Get first few paragraphs
  const paragraphs = cleanContent.match(/<p[^>]*>([^<]+)<\/p>/gi) || [];
  const firstParagraphs = paragraphs.slice(0, 3)
    .map(p => p.replace(/<[^>]+>/g, "").trim())
    .filter(p => p.length > 20)
    .join(" ");
  
  // Extract hero section content (common class patterns)
  const heroPatterns = [
    /class="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section)>/gi,
    /class="[^"]*banner[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section)>/gi,
    /class="[^"]*jumbotron[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section)>/gi,
  ];
  
  let heroContent = "";
  for (const pattern of heroPatterns) {
    const match = cleanContent.match(pattern);
    if (match) {
      heroContent = match[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 500);
      break;
    }
  }
  
  const contentToAnalyze = `
URL: ${url}
Title: ${title}
Meta Description: ${metaDescription}
H1: ${h1}
First Paragraphs: ${firstParagraphs.substring(0, 500)}
Hero Content: ${heroContent}
  `.trim();

  const prompt = `Analyze this homepage and extract what an AI system would understand about this business.

${contentToAnalyze}

Extract:
1. Industry/category (be specific, not generic like "technology")
2. Primary target audience (who are they helping?)
3. Core problem they solve (what pain point?)
4. How they solve it (their method/approach)

Also calculate a confidence score (0-100) based on clarity:
- Start at 100%
- Minus 10% if no clear audience mentioned or it's too vague
- Minus 10% if no clear problem mentioned
- Minus 10% if no solution method mentioned
- Minus 15% if opening content is too generic or unclear
- Minimum score is 50%

Return ONLY valid JSON:
{
  "industry": "specific industry/category",
  "audience": "specific target audience",
  "problem": "the problem they solve",
  "solution": "how they solve it",
  "confidenceScore": number,
  "confidenceBreakdown": {
    "hasAudience": boolean,
    "hasProblem": boolean,
    "hasSolution": boolean,
    "isSpecific": boolean
  }
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error("AI Interpretation API error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0].message.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(content);
    
    // Build the interpretation sentence
    const interpretation = `AI reads your site as: A ${parsed.industry} company helping ${parsed.audience} solve ${parsed.problem} by ${parsed.solution}.`;
    
    return {
      interpretation,
      industry: parsed.industry || "Unknown",
      audience: parsed.audience || "Unknown",
      problem: parsed.problem || "Unknown",
      solution: parsed.solution || "Unknown",
      confidenceScore: Math.max(50, Math.min(100, parsed.confidenceScore || 50)),
      confidenceBreakdown: {
        hasAudience: parsed.confidenceBreakdown?.hasAudience ?? false,
        hasProblem: parsed.confidenceBreakdown?.hasProblem ?? false,
        hasSolution: parsed.confidenceBreakdown?.hasSolution ?? false,
        isSpecific: parsed.confidenceBreakdown?.isSpecific ?? false,
      },
    };
  } catch (error) {
    console.error("AI Interpretation failed:", error);
    return null;
  }
};

// =============================================================================
// ERROR RESPONSE HELPERS
// =============================================================================

const formatDateForUser = (date: Date): string => {
  return (
    new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date) + " (IST)"
  );
};

const createErrorResponse = (
  type: ErrorType,
  details: Partial<Omit<ErrorResponse, "success" | "error_type">>
): Response => {
  const response: ErrorResponse = {
    success: false,
    error_type: type,
    error_code: details.error_code || `${type}_${Date.now()}`,
    user_message: details.user_message || "An error occurred",
    suggested_action: details.suggested_action,
    technical_details: details.technical_details,
    cached_test_id: details.cached_test_id,
    cached_score: details.cached_score,
    cached_created_at: details.cached_created_at,
    test_id: details.test_id,
    testedAt: details.testedAt,
    canRetestAt: details.canRetestAt,
    attempts_exhausted: details.attempts_exhausted,
    next_available_time: details.next_available_time,
  };

  console.error("FoundIndex Error:", response);

  const status = type.startsWith("RATE_LIMIT") ? 429 : 400;

  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

const createUrlCooldownResponse = (payload: {
  test_id: string;
  testedAt: string;
  canRetestAt: string;
  cached_score?: number;
  cached_created_at?: string;
  attempts_exhausted?: boolean;
  user_message?: string;
  next_available_time?: string;
  suggested_action?: string;
}): Response => {
  const response: ErrorResponse = {
    success: false,
    error_type: "RATE_LIMIT_URL",
    user_message:
      payload.user_message ||
      `This URL was tested on ${formatDateForUser(new Date(payload.testedAt))}.`,
    test_id: payload.test_id,
    testedAt: payload.testedAt,
    canRetestAt: payload.canRetestAt,
    cached_score:
      typeof payload.cached_score === "number" ? payload.cached_score : undefined,
    cached_created_at: payload.cached_created_at,
    attempts_exhausted: !!payload.attempts_exhausted,
    next_available_time: payload.next_available_time,
    suggested_action:
      payload.suggested_action ||
      "You can view previous results or retest after the cooldown.",
  };

  console.warn("URL cooldown response:", response);

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

// =============================================================================
// RATE LIMITING WITH CACHING
// =============================================================================

// ============================================================================
// DOMAIN ALLOWLIST - Domains that bypass cooldown restrictions (temporary)
// TODO: Remove or disable before public launch
// ============================================================================
const COOLDOWN_BYPASS_DOMAINS = [
  'foundindex.com',
  'foundmvp.com',
  'foundcandidate.com',
];

const normalizeUrlForAllowlist = (url: string): string => {
  let normalized = url.toLowerCase().trim();
  normalized = normalized.replace(/^https?:\/\//, '');
  normalized = normalized.replace(/^www\./, '');
  normalized = normalized.replace(/\/.*$/, ''); // Remove path
  return normalized;
};

const isDomainAllowlisted = (url: string): boolean => {
  const normalized = normalizeUrlForAllowlist(url);
  return COOLDOWN_BYPASS_DOMAINS.some(domain => 
    normalized === domain || normalized.endsWith('.' + domain)
  );
};

interface CachedTestResult {
  allowed: boolean;
  daysRemaining?: number;
  lastTestDate?: string;
  cachedTestId?: string;
  cachedScore?: number;
  cachedCreatedAt?: string;
}

const checkRateLimitWithCache = async (
  supabase: any,
  url: string
): Promise<CachedTestResult> => {
  const COOLDOWN_DAYS = 7;

  // Check allowlist first - bypass cooldown for owned domains
  if (isDomainAllowlisted(url)) {
    console.log(`[rate-limit] ALLOWLISTED DOMAIN - bypassing cooldown for: ${url}`);
    return { allowed: true };
  }

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

    const testData = data[0] as {
      test_id: string;
      score: number;
      created_at: string;
    };
    const lastTest = new Date(testData.created_at);
    const now = new Date();
    const daysSinceLastTest = Math.floor(
      (now.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24)
    );

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
      return new Response(
        JSON.stringify({
          success: false,
          error: "testType must be 'homepage' or 'blog'",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const validatedEmail = validateEmail(email);
    const validatedWebsite = validateWebsite(website);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[INIT] Supabase URL:", supabaseUrl ? "SET" : "MISSING");
    console.log("[INIT] Supabase Key:", supabaseKey ? `SET (length: ${supabaseKey.length})` : "MISSING");

    if (!supabaseUrl || !supabaseKey) {
      console.error("[INIT] Missing Supabase credentials!");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error. Please contact support.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Get client IP for rate limiting
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Blog posts have a 3 per 7 days limit (rolling window)
    // Homepage tests are UNLIMITED (no IP rate limit for homepage)
    if (testType === "blog") {
      const BLOG_TESTS_LIMIT = 3;
      const ROLLING_WINDOW_DAYS = 7;
      const windowStart = new Date(
        Date.now() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000
      );

      const { data: recentBlogTests, error: blogCountError } = await supabaseAdmin
        .from("test_submissions")
        .select("created_at")
        .eq("ip_address", clientIP)
        .gte("created_at", windowStart.toISOString())
        .order("created_at", { ascending: true });

      if (blogCountError) {
        console.error("Blog rate limit check failed:", blogCountError);
      } else if (recentBlogTests && recentBlogTests.length >= BLOG_TESTS_LIMIT) {
        const firstTestDate = new Date(recentBlogTests[0].created_at);
        const resetDate = new Date(
          firstTestDate.getTime() + ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000
        );

        console.warn(
          `[rate-limit] IP ${clientIP} exceeded blog limit: ${recentBlogTests.length} posts in ${ROLLING_WINDOW_DAYS} days`
        );

        return createErrorResponse("RATE_LIMIT_IP", {
          user_message: `You've tested ${BLOG_TESTS_LIMIT} blog posts in the last ${ROLLING_WINDOW_DAYS} days. You can test more blog posts on ${formatDateForUser(resetDate)}. Homepage tests are unlimited!`,
          next_available_time: resetDate.toISOString(),
          suggested_action: "Test homepages (unlimited) or wait until reset date",
          technical_details: `IP: ${clientIP}, Blog posts in window: ${recentBlogTests.length}`,
        });
      }

      const remaining = BLOG_TESTS_LIMIT - (recentBlogTests?.length || 0);
      console.log(
        `[rate-limit] IP ${clientIP} has ${remaining}/${BLOG_TESTS_LIMIT} blog tests remaining`
      );
    } else {
      console.log(`[rate-limit] Homepage test for IP ${clientIP} - no limit applied`);
    }

    // Check URL cooldown (7 days) and return cached results if within cooldown
    const urlRateCheck = await checkRateLimitWithCache(
      supabaseAdmin,
      validatedWebsite
    );

    if (!urlRateCheck.allowed && urlRateCheck.cachedTestId) {
      const testDate = new Date(urlRateCheck.cachedCreatedAt!);
      const nextTestDate = new Date(testDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      console.log(
        `[rate-limit] URL ${validatedWebsite} in cooldown, returning cached results`
      );

      return createUrlCooldownResponse({
        test_id: urlRateCheck.cachedTestId!,
        testedAt: testDate.toISOString(),
        canRetestAt: nextTestDate.toISOString(),
        cached_score: urlRateCheck.cachedScore,
        cached_created_at: urlRateCheck.cachedCreatedAt,
        attempts_exhausted: false,
        user_message: `This URL was tested on ${formatDateForUser(testDate)}. Same URL can be retested on ${formatDateForUser(nextTestDate)}.`,
        next_available_time: nextTestDate.toISOString(),
        suggested_action:
          "We will show you the previous results. Made changes? Contact us for a priority retest.",
      });
    }

    // Start actual analysis
    const testId = crypto.randomUUID();
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const modelName = Deno.env.get("OPENAI_MODEL_NAME") || "gpt-4o-mini";

    console.log(`[${testId}] Starting analysis for ${testType}: ${validatedWebsite}`);

    let websiteHtml = "";
    let originalHtml = ""; // Keep original for schema extraction
    let fetchSuccess = false;
    let fetchError: Error | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const websiteResponse = await fetch(validatedWebsite, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; FoundIndex-Bot/1.0; +https://foundindex.com)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (websiteResponse.ok) {
        websiteHtml = await websiteResponse.text();
        originalHtml = websiteHtml; // Preserve original HTML for schema extraction
        fetchSuccess = true;
        console.log(`[${testId}] Fetched ${websiteHtml.length} chars`);
      } else {
        console.error(
          `[${testId}] Fetch failed with status: ${websiteResponse.status}`
        );
      }
    } catch (err) {
      fetchError = err instanceof Error ? err : new Error(String(err));
      console.error(`[${testId}] Fetch failed:`, fetchError);

      if ((fetchError as { name?: string })?.name === "AbortError") {
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
    let schemaLocation: "static" | "javascript" | "both" | "none" = "none";
    let jinaRenderedContent: string | undefined = undefined; // Store Jina output for semantic analysis

    // Check if schema exists in original static HTML
    const staticSchemas = extractJsonLd(originalHtml);
    const hasStaticSchema = staticSchemas.length > 0;
    
    console.log(`[${testId}] Static HTML schema check: ${hasStaticSchema ? staticSchemas.length + ' schemas found' : 'no schemas'}`);

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
            jinaRenderedContent = rendered; // Store for semantic analysis
            // DON'T replace websiteHtml with Jina output - keep original for schema
            // Only use Jina for text content analysis
            console.log(`[${testId}] Jina.ai rendered ${rendered.length} chars (kept original HTML for schema)`);
            
            // Check if Jina rendered content has additional schema (unlikely but check)
            const jinaSchemas = extractJsonLd(rendered);
            if (jinaSchemas.length > 0 && !hasStaticSchema) {
              schemaLocation = "javascript";
            } else if (hasStaticSchema && jinaSchemas.length > 0) {
              schemaLocation = "both";
            } else if (hasStaticSchema) {
              schemaLocation = "static";
            }
            
            isLikelyJSRendered = false;
          }
        }
      } catch (e) {
        console.warn(`[${testId}] Jina.ai failed:`, e);
      }
    } else {
      // Not JS-rendered, schema location is static if found
      schemaLocation = hasStaticSchema ? "static" : "none";
    }

    if (isLikelyJSRendered && textContent.length < 200) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Unable to analyze JavaScript-rendered website. Ensure your content is server-rendered for AI visibility.",
          testId,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const detectedType = detectPageType(validatedWebsite, websiteHtml, testType);
    console.log(`[${testId}] Detected type: ${detectedType}, Requested: ${testType}`);

    const analysisType = detectedType;

    // Use ORIGINAL HTML for schema extraction (not Jina-replaced content)
    const schemaResult = parseSchemaMarkupWithLocation(originalHtml, analysisType, schemaLocation);
    // Pass Jina rendered content (if available) for semantic analysis of JS sites
    const semanticResult = analyzeSemanticHtml(originalHtml, analysisType, jinaRenderedContent);
    const technicalResult = analyzeTechnical(validatedWebsite, originalHtml);
    const imageResult = analyzeImages(originalHtml, analysisType);

    const schemaWeight = analysisType === "homepage" ? 20 : 18;
    const semanticWeight = analysisType === "homepage" ? 12 : 14;
    const technicalWeight = 8;
    const imageWeight = analysisType === "homepage" ? 0 : 8;

    // Safe score calculations with division-by-zero and NaN checks
    const schemaScore =
      schemaResult.maxScore > 0
        ? (schemaResult.totalScore / schemaResult.maxScore) * schemaWeight
        : 0;
    const semanticScore =
      semanticResult.maxScore > 0
        ? (semanticResult.score / semanticResult.maxScore) * semanticWeight
        : 0;
    const technicalScore =
      technicalResult.maxScore > 0
        ? (technicalResult.score / technicalResult.maxScore) * technicalWeight
        : 0;
    const imageScore =
      imageResult.maxScore > 0
        ? (imageResult.score / imageResult.maxScore) * imageWeight
        : 0;

    // Validate all scores are numbers
    const safeSchemaScore = isNaN(schemaScore) ? 0 : schemaScore;
    const safeSemanticScore = isNaN(semanticScore) ? 0 : semanticScore;
    const safeTechnicalScore = isNaN(technicalScore) ? 0 : technicalScore;
    const safeImageScore = isNaN(imageScore) ? 0 : imageScore;

    console.log(`[${testId}] Scores - Schema: ${safeSchemaScore}, Semantic: ${safeSemanticScore}, Technical: ${safeTechnicalScore}, Image: ${safeImageScore}`);

    const deterministicTotal =
      Math.round((safeSchemaScore + safeSemanticScore + safeTechnicalScore + safeImageScore) * 10) / 10;

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

      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("429")
      ) {
        return createErrorResponse("API_QUOTA", {
          user_message:
            "Our AI service is temporarily at capacity. Please try again in 2-4 hours.",
          suggested_action: "Try again later or contact us to get notified when it is back",
        });
      }

      return createErrorResponse("GENERAL_ERROR", {
        user_message: "AI analysis failed. Please try again.",
        suggested_action: "Try again in a few minutes",
      });
    }

    const aiCategories = (aiAnalysisResult.categories || {}) as Record<
      string,
      { score?: number; max?: number }
    >;
    const aiTotal = Object.values(aiCategories).reduce((sum: number, cat) => {
      if (cat && typeof cat === "object" && typeof cat.score === "number" && !isNaN(cat.score)) {
        return sum + cat.score;
      }
      return sum;
    }, 0);

    console.log(`[${testId}] AI Total: ${aiTotal}, Deterministic Total: ${deterministicTotal}`);

    // Final score calculation with NaN fallback
    let totalScore = Math.round(deterministicTotal + aiTotal);
    if (isNaN(totalScore) || totalScore < 0) {
      console.warn(`[${testId}] Score was NaN or negative, defaulting to 0`);
      totalScore = 0;
    }
    if (totalScore > 100) {
      totalScore = 100;
    }

    console.log(`[${testId}] Final score: ${totalScore}`);
    const grade = getGrade(totalScore);

    const displayCategories: Record<string, unknown> = {
      schemaMarkup: {
        score: Math.round(safeSchemaScore * 10) / 10,
        max: schemaWeight,
        percentage: schemaWeight > 0 ? Math.round((safeSchemaScore / schemaWeight) * 100) : 0,
        breakdown: schemaResult,
      },
      semanticStructure: {
        score: Math.round(safeSemanticScore * 10) / 10,
        max: semanticWeight,
        percentage: semanticWeight > 0 ? Math.round((safeSemanticScore / semanticWeight) * 100) : 0,
        details: semanticResult.details,
        breakdown: semanticResult.breakdown,
      },
      technicalFoundation: {
        score: Math.round(safeTechnicalScore * 10) / 10,
        max: technicalWeight,
        percentage: technicalWeight > 0 ? Math.round((safeTechnicalScore / technicalWeight) * 100) : 0,
        details: technicalResult.details,
      },
    };

    if (analysisType === "blog") {
      displayCategories.images = {
        score: Math.round(safeImageScore * 10) / 10,
        max: imageWeight,
        percentage: imageWeight > 0 ? Math.round((safeImageScore / imageWeight) * 100) : 0,
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

    const schemaRecommendations = schemaResult.scores
      .filter((s: SchemaScore) => {
        if (!s.found && analysisType === "blog" && s.category === "BlogPosting") {
          const hasArticle = schemaResult.schemas.some(
            (schema: { type: string }) =>
              ["Article", "BlogPosting", "NewsArticle", "TechArticle"].includes(schema.type)
          );
          if (hasArticle) {
            return false;
          }
        }
        return !s.found || s.missingFields.length > 0;
      })
      .slice(0, 3)
      .map((s: SchemaScore, idx: number) => ({
        id: `schema-${idx}`,
        priority: s.found ? "medium" : "critical",
        title: s.found
          ? `Complete your ${s.category} schema`
          : `Add ${s.category} schema markup`,
        pointsLost: -Math.round((s.maxPoints - s.earnedPoints) * 10) / 10,
        problem: s.details,
        howToFix: s.found
          ? [`Add missing fields: ${s.missingFields.join(", ")}`]
          : [
              `Add ${s.category} schema to your page`,
              `Use JSON-LD format`,
              `Include: ${s.missingFields.join(", ")}`,
            ],
        codeExample: !s.found
          ? `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "${s.category}",\n  ${s.missingFields.map((f: string) => `"${f}": "..."`).join(",\n  ")}\n}\n</script>`
          : "",
        expectedImprovement: `+${Math.round((s.maxPoints - s.earnedPoints) * 10) / 10} points`,
      }));

    const aiRecommendations = Array.isArray(aiAnalysisResult.recommendations)
      ? aiAnalysisResult.recommendations
      : [];

    const allRecommendations = [...schemaRecommendations, ...aiRecommendations].map(
      (rec, idx) => {
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
      }
    );

    allRecommendations.sort((a, b) => {
      const priorityOrder: Record<string, number> = { critical: 0, medium: 1, good: 2 };
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    });

    // Run AI interpretation for homepages only
    let aiInterpretation: AIInterpretation | null = null;
    if (analysisType === "homepage" && openaiApiKey) {
      console.log(`[${testId}] Running AI interpretation analysis...`);
      aiInterpretation = await analyzeAIInterpretation(
        originalHtml,
        validatedWebsite,
        openaiApiKey,
        modelName
      );
      
      if (aiInterpretation) {
        console.log(`[${testId}] AI Interpretation: confidence ${aiInterpretation.confidenceScore}%`);
        
        // Save to ai_interpretations table
        const { error: interpretationError } = await supabaseAdmin
          .from("ai_interpretations")
          .insert({
            test_id: testId,
            url_tested: validatedWebsite,
            ai_interpretation: aiInterpretation.interpretation,
            confidence_score: aiInterpretation.confidenceScore,
          });
        
        if (interpretationError) {
          console.warn(`[${testId}] Failed to save AI interpretation:`, interpretationError.message);
        }
      }
    }

    let industryAverage = 58;
    try {
      const { data: avgData } = await supabaseAdmin
        .from("test_history")
        .select("score")
        .eq("test_type", analysisType)
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (avgData && avgData.length > 5) {
        const scores = avgData.map((d: { score: number }) => d.score);
        industryAverage = Math.round(
          scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        );
      }
    } catch (e) {
      console.warn(`[${testId}] Could not calculate industry average:`, e);
    }

    // Save to test_history
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

    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from("test_history")
      .insert(insertData)
      .select();

    if (insertError) {
      console.error(`[${testId}] ❌ DATABASE ERROR:`, insertError.message);
    } else {
      console.log(`[${testId}] ✅ SAVED TO DATABASE: ${insertResult?.[0]?.id}`);
    }

    await supabaseAdmin.from("test_submissions").insert({
      email: validatedEmail,
      ip_address: clientIP,
      test_id: testId,
      created_at: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    console.log(
      `[${testId}] SUCCESS - Score: ${totalScore}, Grade: ${grade}, Duration: ${duration}ms`
    );

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
        aiInterpretation: aiInterpretation ? {
          interpretation: aiInterpretation.interpretation,
          industry: aiInterpretation.industry,
          audience: aiInterpretation.audience,
          problem: aiInterpretation.problem,
          solution: aiInterpretation.solution,
          confidenceScore: aiInterpretation.confidenceScore,
          confidenceBreakdown: aiInterpretation.confidenceBreakdown,
        } : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("FATAL ERROR:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
