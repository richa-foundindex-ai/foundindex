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

/* (other interfaces omitted for brevity in this header - they remain the same as your file) */

// =============================================================================
// (All helper functions like SCHEMA parsing, semantic, technical, images, etc.)
// (I am keeping your existing analyzer logic intact — only rate-limit + response changes below)
// =============================================================================

// ... KEEP ALL existing analyzer functions exactly as in your current file up to createErrorResponse ...
// (For brevity in this patch message I'm reusing your functions verbatim. In your copy-paste, leave them as-is.)
// The file prior to the RATE LIMITING section remains unchanged (extractJsonLd, parseJsonLdItems, parseSchemaMarkup, analyzeSemanticHtml, analyzeTechnical, analyzeImages, helpers, etc.)

// =============================================================================
// ERROR RESPONSE HELPERS (UPDATED)
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

/**
 * Generic error response — use for normal errors. Default status: 429 for RATE_LIMIT types, 400 for others.
 */
const createErrorResponse = (
  type: ErrorType,
  details: Partial<Omit<ErrorResponse, "success" | "error_type">>,
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

/**
 * Special helper for URL cooldown responses.
 * We return HTTP 200 here (so frontend supabase.functions.invoke sees `data` reliably)
 * but include success:false and error_type: "RATE_LIMIT_URL" — frontend will open the modal.
 */
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
    user_message: payload.user_message || `This URL was tested on ${formatDateForUser(new Date(payload.testedAt))}.`,
    test_id: payload.test_id,
    testedAt: payload.testedAt,
    canRetestAt: payload.canRetestAt,
    cached_score: typeof payload.cached_score === "number" ? payload.cached_score : undefined,
    cached_created_at: payload.cached_created_at,
    attempts_exhausted: !!payload.attempts_exhausted,
    next_available_time: payload.next_available_time,
    suggested_action: payload.suggested_action || "You can view previous results or retest after the cooldown.",
  };

  console.warn("URL cooldown response:", response);

  // Return 200 so client receives the body as `data` in supabase.functions.invoke
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

// =============================================================================
// RATE LIMITING WITH CACHING (UNCHANGED LOGIC EXCEPT WINDOW LENGTHS)
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

    // Blog posts have a 3 per 7 days limit (rolling window)
    // Homepage tests are UNLIMITED (no IP rate limit for homepage)
    if (testType === "blog") {
      const BLOG_TESTS_LIMIT = 3;
      const ROLLING_WINDOW_DAYS = 7; // changed to 7 days to match frontend expectations
      const windowStart = new Date(Date.now() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

      const { data: recentBlogTests, error: blogCountError } = await supabaseAdmin
        .from("test_submissions")
        .select("created_at")
        .eq("ip_address", clientIP)
        .gte("created_at", windowStart.toISOString())
        .order("created_at", { ascending: true });

      if (blogCountError) {
        console.error("Blog rate limit check failed:", blogCountError);
      } else if (recentBlogTests && recentBlogTests.length >= BLOG_TESTS_LIMIT) {
        // Calculate reset date: ROLLING_WINDOW_DAYS from FIRST test in this window
        const firstTestDate = new Date(recentBlogTests[0].created_at);
        const resetDate = new Date(firstTestDate.getTime() + ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

        console.warn(
          `[rate-limit] IP ${clientIP} exceeded blog limit: ${recentBlogTests.length} posts in ${ROLLING_WINDOW_DAYS} days`,
        );

        return createErrorResponse("RATE_LIMIT_IP", {
          user_message: `You've tested ${BLOG_TESTS_LIMIT} blog posts in the last ${ROLLING_WINDOW_DAYS} days. You can test more blog posts on ${formatDateForUser(resetDate)}. Homepage tests are unlimited!`,
          next_available_time: resetDate.toISOString(),
          suggested_action: "Test homepages (unlimited) or wait until reset date",
          technical_details: `IP: ${clientIP}, Blog posts in window: ${recentBlogTests.length}`,
        });
      }

      const remaining = BLOG_TESTS_LIMIT - (recentBlogTests?.length || 0);
      console.log(`[rate-limit] IP ${clientIP} has ${remaining}/${3} blog tests remaining`);
    } else {
      console.log(`[rate-limit] Homepage test for IP ${clientIP} - no limit applied`);
    }

    // Check URL cooldown (7 days) and return cached results if within cooldown
    const urlRateCheck = await checkRateLimitWithCache(supabaseAdmin, validatedWebsite);

    if (!urlRateCheck.allowed && urlRateCheck.cachedTestId) {
      const testDate = new Date(urlRateCheck.cachedCreatedAt!);
      const nextTestDate = new Date(testDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      console.log(`[rate-limit] URL ${validatedWebsite} in cooldown, returning cached results`);

      // Return a structured RATE_LIMIT_URL payload but with HTTP 200 — frontend expects data to be present.
      return createUrlCooldownResponse({
        test_id: urlRateCheck.cachedTestId!,
        testedAt: testDate.toISOString(),
        canRetestAt: nextTestDate.toISOString(),
        cached_score: urlRateCheck.cachedScore,
        cached_created_at: urlRateCheck.cachedCreatedAt,
        attempts_exhausted: false,
        user_message: `This URL was tested on ${formatDateForUser(testDate)}. Same URL can be retested on ${formatDateForUser(nextTestDate)}.`,
        next_available_time: nextTestDate.toISOString(),
        suggested_action: "We will show you the previous results. Made changes? Contact us for a priority retest.",
      });
    }

    // ... (remaining analysis flow unchanged) ...
    // Keep the rest of your code from fetching website, Jina rendering fallback, AI call, scoring, DB inserts, etc.
    // But ensure we use the same variable names and return the final success payload exactly as before.

    // --- Begin original analysis / AI / scoring / inserts ---
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
      if ((fetchError as any)?.name === "AbortError") {
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
      // Keep this response as-is (returns success:false etc.) - frontend can handle it
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

    const extractedContent = websiteHtml.substring(0, 50000);

    // Build analysisPrompt (same as your original code)
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

    // Compose final results (same as your original code)
    const aiCategories = (aiAnalysisResult.categories || {}) as Record<string, { score?: number; max?: number }>;
    const aiTotal = Object.values(aiCategories).reduce((sum: number, cat) => {
      if (cat && typeof cat === "object" && typeof (cat as any).score === "number") {
        return sum + ((cat as any).score as number);
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

    // Map AI categories into displayCategories
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

    // Schema recommendations + AI recs composition (as in original)
    const schemaRecommendations = schemaResult.scores
      .filter((s) => {
        if (!s.found && analysisType === "blog" && s.category === "BlogPosting") {
          const hasArticle = schemaResult.schemas.some((schema) =>
            ["Article", "BlogPosting", "NewsArticle", "TechArticle"].includes(schema.type),
          );
          if (hasArticle) {
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
