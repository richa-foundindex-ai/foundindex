import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestSubmission {
  website: string;
  testType: "homepage" | "blog";
  email?: string;
}

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
  if (!trimmed) {
    throw new Error("Please enter a website URL");
  }

  const normalized = normalizeUrl(trimmed);

  // Allow both http and https as long as there is a dot in the domain
  if (normalized.includes(".")) {
    return normalized;
  }

  throw new Error('Please enter a valid website URL (like "example.com")');
};

const detectPageType = (url: string, html: string): "homepage" | "blog" => {
  const urlLower = url.toLowerCase();

  // Check URL patterns
  const blogPatterns = ["/blog/", "/post/", "/article/", "/news/"];
  const hasBlogUrl = blogPatterns.some((pattern) => urlLower.includes(pattern));

  // Check HTML patterns
  const hasBlogHTML =
    html.includes("<article") ||
    html.includes('class="post') ||
    html.includes('class="article') ||
    html.includes('id="post-') ||
    html.includes('itemtype="http://schema.org/BlogPosting"');

  return hasBlogUrl || hasBlogHTML ? "blog" : "homepage";
};

const getGrade = (score: number): string => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

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

    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
    const testId = crypto.randomUUID();
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const modelName = Deno.env.get("OPENAI_MODEL_NAME") || "gpt-4-turbo-2024-04-09";

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
          error: "Unable to access website. Please check the URL and try again.",
          testId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check for JS-rendered content
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
          error: "Unable to analyze JavaScript-rendered website. Please ensure your content is server-rendered.",
          testId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Detect actual page type
    const detectedType = detectPageType(validatedWebsite, websiteHtml);
    console.log(`[${testId}] Detected type: ${detectedType}, Requested: ${testType}`);

    // Analyze with OpenAI
    const extractedContent = websiteHtml.substring(0, 50000);

    const analysisPrompt =
      testType === "homepage"
        ? `You are analyzing a business homepage for AI search engine visibility.

Website URL: ${validatedWebsite}
HTML Content: ${extractedContent}

Analyze this homepage across these 5 categories and provide detailed recommendations:

1. ANSWER STRUCTURE (max 30 points): How clearly does the homepage answer "what is this business?"
2. SCANNABILITY (max 25 points): How easy is it to quickly understand key information?
3. FAQ & SCHEMA (max 20 points): Are there FAQs and structured data for AI parsing?
4. EXPERTISE SIGNALS (max 15 points): Does it demonstrate authority and credibility?
5. TECHNICAL SEO (max 10 points): Meta tags, headings, page structure

For each issue found, provide:
- Priority: "critical" (major blocker), "medium" (improvement needed), or "good" (doing well)
- Title: Short, clear issue name
- Points Lost: Numeric value
- Problem: What's wrong
- How to Fix: Specific actionable steps
- Code Example: HTML/code snippet if applicable
- Expected Improvement: Estimated point gain

Return ONLY valid JSON in this exact format:
{
  "categories": {
    "answerStructure": { "score": 18, "max": 30 },
    "scannability": { "score": 14, "max": 25 },
    "faqSchema": { "score": 6, "max": 20 },
    "expertiseSignals": { "score": 12, "max": 15 },
    "technicalSEO": { "score": 8, "max": 10 }
  },
  "recommendations": [
    {
      "priority": "critical",
      "title": "Missing clear value proposition",
      "pointsLost": 10,
      "problem": "The homepage doesn't clearly state what the business does in the first paragraph.",
      "howToFix": "Add a clear 1-2 sentence description at the top that explains what you do and who you serve.",
      "codeExample": "<h1>We help [audience] achieve [outcome] through [method]</h1>",
      "expectedImprovement": "+8-10 points"
    }
  ]
}`
        : `You are analyzing a blog post for AI search engine visibility.

Website URL: ${validatedWebsite}
HTML Content: ${extractedContent}

Analyze this blog post across these 5 categories and provide detailed recommendations:

1. ANSWER STRUCTURE (max 30 points): Does it answer the main question directly and early?
2. SCANNABILITY (max 25 points): Subheadings, bullet points, clear sections?
3. FAQ & SCHEMA (max 20 points): FAQ section and structured data?
4. EXPERTISE SIGNALS (max 15 points): Author credentials, sources, data?
5. TECHNICAL SEO (max 10 points): Title, meta, headings hierarchy

For each issue found, provide:
- Priority: "critical" (major blocker), "medium" (improvement needed), or "good" (doing well)
- Title: Short, clear issue name
- Points Lost: Numeric value
- Problem: What's wrong
- How to Fix: Specific actionable steps
- Code Example: HTML/code snippet if applicable
- Expected Improvement: Estimated point gain

Return ONLY valid JSON in this exact format:
{
  "categories": {
    "answerStructure": { "score": 18, "max": 30 },
    "scannability": { "score": 14, "max": 25 },
    "faqSchema": { "score": 6, "max": 20 },
    "expertiseSignals": { "score": 12, "max": 15 },
    "technicalSEO": { "score": 8, "max": 10 }
  },
  "recommendations": [
    {
      "priority": "critical",
      "title": "Answer appears too late",
      "pointsLost": 12,
      "problem": "The direct answer to the title question doesn't appear until paragraph 4.",
      "howToFix": "Add a 2-3 sentence direct answer immediately after the introduction.",
      "codeExample": "<p class='direct-answer'>To [achieve goal], you need to [action]. This works because [reason].</p>",
      "expectedImprovement": "+10-12 points"
    }
  ]
}`;

    console.log(`[${testId}] Calling OpenAI for ${testType} analysis...`);

    let analysisResult: any;

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
        console.error(`[${testId}] OpenAI API error:`, response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      analysisResult = JSON.parse(content);
      console.log(`[${testId}] Analysis complete`);
    } catch (error) {
      console.error(`[${testId}] Analysis failed:`, error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "AI analysis failed. Please try again.",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Calculate total score
    const categories = analysisResult.categories || {};
    const totalScore = Object.values(categories).reduce((sum: number, cat: any) => sum + (cat.score || 0), 0);

    const grade = getGrade(totalScore);

    // Add percentages to categories
    const categoriesWithPercentages = Object.entries(categories).reduce((acc: any, [key, value]: [string, any]) => {
      acc[key] = {
        ...value,
        percentage: Math.round((value.score / value.max) * 100),
      };
      return acc;
    }, {});

    // ✅ SAVE TO test_history TABLE (PRIMARY RESULTS STORAGE)
    try {
      await supabaseAdmin.from("test_history").insert({
        test_id: testId,
        website: validatedWebsite,
        test_type: testType,
        detected_type: detectedType,
        score: totalScore,
        grade,
        categories: categoriesWithPercentages,
        recommendations: analysisResult.recommendations || [],
      });
      console.log(`[${testId}] Saved to test_history`);
    } catch (historyError) {
      console.error(`[${testId}] CRITICAL: Failed to save to test_history:`, historyError);
      // This is critical - if we can't save results, the results page won't work
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to save test results. Please contact support.",
          details: historyError instanceof Error ? historyError.message : "Database error",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = {
      success: true,
      testId,
      score: totalScore,
      grade,
      detectedType,
      requestedType: testType,
      categories: categoriesWithPercentages,
      recommendations: analysisResult.recommendations || [],
      industryAverage: 62,
    };

    console.log(`[${testId}] SUCCESS - Score: ${totalScore}, Grade: ${grade}`);

    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
