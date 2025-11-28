import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestSubmission {
  email?: string;
  website: string;
  industry?: string;
}

const ALLOWED_INDUSTRIES = ["saas", "financial", "ecommerce", "professional", "healthcare", "other"];

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
  if (trimmed.length === 0) throw new Error("Please enter a website URL");
  const normalized = normalizeUrl(trimmed);
  if (normalized.startsWith("https://") && normalized.includes(".")) return normalized;
  throw new Error('Please enter a valid website URL (like "slack.com")');
};

const validateIndustry = (industry: string | undefined): string => {
  if (!industry) return "other";
  if (!ALLOWED_INDUSTRIES.includes(industry)) {
    throw new Error("Invalid industry. Must be one of: " + ALLOWED_INDUSTRIES.join(", "));
  }
  return industry;
};

const industryQueries: Record<string, string[]> = {
  saas: [
    "best project management software for remote teams",
    "top collaboration tools for startups",
    "recommended CRM platforms for small business",
    "best workflow automation software",
    "top productivity tools for distributed teams",
    "best SaaS solutions for team communication",
    "recommended cloud-based project tools",
    "top software for agile teams",
  ],
  financial: [
    "best accounting software for small business",
    "top financial planning tools",
    "recommended investment platforms",
    "best budgeting software for families",
    "top fintech solutions for businesses",
    "best tools for financial management",
    "recommended platforms for expense tracking",
    "top software for bookkeeping",
  ],
  ecommerce: [
    "best e-commerce platforms for startups",
    "top online store builders",
    "recommended shopping cart software",
    "best solutions for online retail",
    "top platforms for dropshipping",
    "best tools for e-commerce marketing",
    "recommended software for inventory management",
    "top solutions for online payments",
  ],
  professional: [
    "best software for professional services",
    "top tools for consulting firms",
    "recommended platforms for service businesses",
    "best solutions for client management",
    "top software for professional scheduling",
    "best tools for time tracking professionals",
    "recommended platforms for service delivery",
    "top solutions for professional billing",
  ],
  healthcare: [
    "best healthcare management software",
    "top platforms for medical practices",
    "recommended EHR systems",
    "best solutions for patient management",
    "top software for healthcare providers",
    "best tools for medical scheduling",
    "recommended platforms for telehealth",
    "top solutions for healthcare billing",
  ],
  other: [
    "best software solutions for businesses",
    "top tools for operations",
    "recommended platforms for growth",
    "best solutions for efficiency",
    "top software for business management",
    "best tools for productivity",
    "recommended platforms for automation",
    "top solutions for communication",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, website, industry }: TestSubmission = await req.json();

    const validatedEmail = validateEmail(email);
    const validatedWebsite = validateWebsite(website);
    const validatedIndustry = validateIndustry(industry);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
    const testId = crypto.randomUUID();
    const testDate = new Date().toISOString();
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const modelName = Deno.env.get("OPENAI_MODEL_NAME") || "gpt-4-turbo-2024-04-09";

    console.log(`[${testId}] Starting analysis with model: ${modelName}`);

    // Fetch website
    let websiteHtml = "";
    let fetchSuccess = false;

    try {
      const websiteResponse = await fetch(validatedWebsite, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FoundIndex-Bot/1.0)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
          error: "Unable to access website",
          testId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check for JS-rendered content
    const spaMarkers = ['id="root"', 'id="app"', '__NEXT_DATA__', 'window.__NUXT__'];
    const hasSPAMarker = spaMarkers.some(marker => websiteHtml.includes(marker));

    let textContent = websiteHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    let isLikelyJSRendered = hasSPAMarker && textContent.length < 500;

    if (isLikelyJSRendered) {
      console.log(`[${testId}] JS-rendered, trying Jina.ai...`);
      try {
        const jinaResponse = await fetch(`https://r.jina.ai/${validatedWebsite}`, {
          headers: { "Accept": "text/html" },
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
        console.warn(`[${testId}] Jina.ai failed`);
      }
    }

    if (isLikelyJSRendered && textContent.length < 200) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to analyze JavaScript-rendered website",
          testId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Helper function for API calls with retry
    async function callWithRetry(messages: any[], retries = 1): Promise<any> {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            temperature: 0,
            response_format: { type: "json_object" },
            messages: messages,
          }),
        });

        if (!response.ok) {
          if (response.status === 429 && retries > 0) {
            console.log(`[${testId}] 429 - retrying in 2s...`);
            await new Promise(r => setTimeout(r, 2000));
            return callWithRetry(messages, retries - 1);
          }
          throw new Error(`OpenAI error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        return JSON.parse(content);
      } catch (error) {
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 2000));
          return callWithRetry(messages, retries - 1);
        }
        throw error;
      }
    }

    const extractedContent = websiteHtml.substring(0, 50000);

    console.log(`[${testId}] STEP 2: AI-Readiness Audit (2 parallel calls)...`);

    const structuralPrompt = `Analyze website structure. Return ONLY JSON:

{
  "content_clarity_score": number (0-25),
  "discoverability_score": number (0-20),
  "technical_score": number (0-15)
}

Website: ${validatedWebsite}
Content: ${extractedContent}

Return ONLY JSON.`;

    const businessPrompt = `Analyze business credibility. Return ONLY JSON:

{
  "authority_score": number (0-15),
  "positioning_score": number (0-15),
  "recommendations": [array of 3-5 improvements]
}

Website: ${validatedWebsite}
Content: ${extractedContent}

Return ONLY JSON.`;

    let structuralResult: any = null;
    let businessResult: any = null;

    try {
      [structuralResult, businessResult] = await Promise.all([
        callWithRetry([{ role: "user", content: structuralPrompt }]),
        callWithRetry([{ role: "user", content: businessPrompt }])
      ]);
    } catch (error) {
      console.error(`[${testId}] Audit failed:`, error);
      return new Response(
        JSON.stringify({ success: false, error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scores = {
      content_clarity_score: structuralResult?.content_clarity_score || 0,
      discoverability_score: structuralResult?.discoverability_score || 0,
      technical_score: structuralResult?.technical_score || 0,
      authority_score: businessResult?.authority_score || 0,
      positioning_score: businessResult?.positioning_score || 0,
      recommendations: businessResult?.recommendations || []
    };

    const foundindex_score =
      scores.content_clarity_score +
      scores.discoverability_score +
      scores.authority_score +
      scores.technical_score +
      scores.positioning_score;

    console.log(`[${testId}] Audit complete - Score: ${foundindex_score}/100`);

    console.log(`[${testId}] STEP 3: Generate queries...`);

    let businessType = validatedIndustry;
    let queries: string[] = [];

    try {
      const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Analyze: ${validatedWebsite}. Industry: ${validatedIndustry}. Return JSON: {"business_type": "...", "queries": [8 buyer queries]}`,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (analysisResponse.ok) {
        const data = await analysisResponse.json();
        let text = data.choices[0].message.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(text);
        businessType = parsed.business_type || validatedIndustry;
        queries = parsed.queries || [];
      }

      if (!queries || queries.length < 5) {
        queries = industryQueries[validatedIndustry] || industryQueries.other;
      }
    } catch (error) {
      queries = industryQueries[validatedIndustry] || industryQueries.other;
    }

    console.log(`[${testId}] STEP 4: Visibility test (SINGLE BATCH)...`);

    let totalRecommendations = 0;
    const queryResults = [];

    try {
      const testQueries = queries.slice(0, 8);
      
      const batchPrompt = `Test these queries for ${validatedWebsite}. Return JSON:
{"results": [{"query": "...", "was_recommended": true/false, "reason": "..."}]}

Queries:
${testQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

      console.log(`[${testId}] Single batch: ${testQueries.length} queries...`);

      const batchResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: batchPrompt }],
        }),
      });

      const batchData = await batchResponse.json();
      const batchContent = batchData.choices[0].message.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(batchContent);
      const results = parsed.results || [];

      totalRecommendations = results.filter((r: any) => r.was_recommended).length;

      results.forEach((result: any, index: number) => {
        queryResults.push({
          query_number: index + 1,
          query_text: result.query || testQueries[index],
          engine: "ChatGPT",
          was_recommended: result.was_recommended,
          context_snippet: result.reason || "Batch analyzed",
          recommendation_position: result.was_recommended ? 1 : null,
          quality_rating: result.was_recommended ? "high" : "none",
        });
      });

      console.log(`[${testId}] Batch complete: ${totalRecommendations}/${results.length}`);

    } catch (error) {
      console.error(`[${testId}] Batch failed, fallback:`, error);

      // Fallback: 3 queries
      const fallbackQueries = queries.slice(0, 3);

      for (let i = 0; i < fallbackQueries.length; i++) {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: fallbackQueries[i] }],
              max_tokens: 300,
            }),
          });

          const data = await response.json();
          const aiResponse = data.choices[0].message.content;

          let domain = validatedWebsite.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
          const brandName = domain.split(".")[0];
          const wasRecommended = aiResponse.toLowerCase().includes(domain.toLowerCase()) || 
                                 aiResponse.toLowerCase().includes(brandName.toLowerCase());

          if (wasRecommended) totalRecommendations++;

          queryResults.push({
            query_number: i + 1,
            query_text: fallbackQueries[i],
            engine: "ChatGPT",
            was_recommended: wasRecommended,
            context_snippet: aiResponse.substring(0, 200),
            recommendation_position: wasRecommended ? 1 : null,
            quality_rating: wasRecommended ? "high" : "none",
          });
        } catch (e) {
          queryResults.push({
            query_number: i + 1,
            query_text: fallbackQueries[i],
            engine: "ChatGPT",
            was_recommended: false,
            context_snippet: "Error",
            recommendation_position: null,
            quality_rating: "none",
          });
        }
      }
    }

    const recommendationRate = (totalRecommendations / Math.max(queryResults.length, 1)) * 100;
    const chatgptScore = Math.round(recommendationRate);

    console.log(`[${testId}] Final: ${totalRecommendations}/${queryResults.length} = ${chatgptScore}%`);

    // Save to Supabase
    await supabaseAdmin.from("test_submissions").insert({
      email: validatedEmail,
      ip_address: clientIP,
      test_id: testId,
      created_at: testDate,
    });

    // Save to Airtable
    const airtableApiKey = Deno.env.get("AIRTABLE_API_KEY");
    const airtableBaseId = Deno.env.get("AIRTABLE_BASE_ID");

    await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Tests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          test_id: testId,
          user_email: validatedEmail,
          website_url: validatedWebsite,
          industry: validatedIndustry,
          test_date: testDate,
          foundindex_score: foundindex_score,
          content_clarity_score: scores.content_clarity_score,
          structured_data_score: scores.technical_score,
          authority_score: scores.authority_score,
          discoverability_score: scores.discoverability_score,
          comparison_score: scores.positioning_score,
          recommendations: JSON.stringify(scores.recommendations),
          business_type: businessType,
          chatgpt_score: chatgptScore,
          recommendations_count: totalRecommendations,
          recommendation_rate: parseFloat(recommendationRate.toFixed(3)),
        },
      }),
    });

    // Save query results
    for (let i = 0; i < queryResults.length; i += 10) {
      const batch = queryResults.slice(i, i + 10);
      await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Query_Results`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${airtableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: batch.map((result) => ({ fields: { test_id: testId, ...result } })),
        }),
      });
    }

    console.log(`[${testId}] SUCCESS`);

    return new Response(
      JSON.stringify({
        success: true,
        testId,
        score: foundindex_score,
        foundIndexScore: chatgptScore,
        totalRecommendations,
        totalQueries: queryResults.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred",
        details: error instanceof Error ? error.message : "Unknown",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
