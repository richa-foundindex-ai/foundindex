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

// Input validation schemas
const ALLOWED_INDUSTRIES = ["saas", "financial", "ecommerce", "professional", "healthcare", "other"];

const validateEmail = (email: string | undefined): string => {
  if (!email) {
    return `anonymous-${Date.now()}@foundindex.local`;
  }
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 255) {
    throw new Error("Email must be less than 255 characters");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email format");
  }
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
  if (trimmed.length === 0) {
    throw new Error("Please enter a website URL");
  }
  const normalized = normalizeUrl(trimmed);
  if (normalized.startsWith("https://") && normalized.includes(".")) {
    return normalized;
  }
  throw new Error('Please enter a valid website URL (like "slack.com")');
};

const validateIndustry = (industry: string | undefined): string => {
  if (!industry) {
    return "other";
  }
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
    "best tools for remote work collaboration",
    "recommended software for startup growth",
    "top platforms for team productivity",
    "best SaaS tools for business operations",
    "recommended solutions for workflow management",
    "top software for project tracking",
    "best cloud tools for team collaboration",
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
    "best solutions for financial analytics",
    "recommended tools for portfolio management",
    "top platforms for payment processing",
    "best software for financial reporting",
    "recommended solutions for tax management",
    "top tools for invoicing",
    "best platforms for financial planning",
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
    "best platforms for digital products",
    "recommended tools for store optimization",
    "top e-commerce solutions for small business",
    "best software for product catalogs",
    "recommended platforms for multi-channel selling",
    "top tools for order fulfillment",
    "best solutions for customer reviews",
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
    "best software for contract management",
    "recommended tools for professional collaboration",
    "top platforms for service automation",
    "best solutions for client communication",
    "recommended software for professional reporting",
    "top tools for resource planning",
    "best platforms for professional workflows",
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
    "best software for patient records",
    "recommended tools for healthcare analytics",
    "top platforms for medical compliance",
    "best solutions for healthcare communication",
    "recommended software for practice management",
    "top tools for healthcare workflows",
    "best platforms for patient engagement",
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
    "best software for collaboration",
    "recommended tools for analytics",
    "top platforms for customer service",
    "best solutions for workflow",
    "recommended software for reporting",
    "top tools for data management",
    "best platforms for business operations",
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

    console.log("Processing test for industry:", validatedIndustry);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

    const testId = crypto.randomUUID();
    const testDate = new Date().toISOString();

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    console.log(`[${testId}] ===================`);
    console.log(`[${testId}] STEP 1: Fetching website content...`);
    console.log(`[${testId}] ===================`);

    let websiteHtml = "";
    let fetchSuccess = false;
    let fetchErrorReason = "";

    try {
      console.log(`[${testId}] Attempting to fetch: ${validatedWebsite}`);
      const websiteResponse = await fetch(validatedWebsite, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FoundIndex-Bot/1.0; +https://foundindex.com)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });

      if (websiteResponse.ok) {
        websiteHtml = await websiteResponse.text();
        fetchSuccess = true;
        console.log(`[${testId}] Website content fetched successfully (${websiteHtml.length} chars)`);

        if (websiteHtml.length < 500) {
          console.warn(`[${testId}] WARNING: Website content is very short (${websiteHtml.length} chars)`);
          fetchErrorReason = `Website returned very little content (${websiteHtml.length} chars)`;
        }
      } else {
        fetchErrorReason = `Website returned HTTP ${websiteResponse.status}: ${websiteResponse.statusText}`;
        console.warn(`[${testId}] ${fetchErrorReason}`);
      }
    } catch (fetchError) {
      fetchErrorReason = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      console.error(`[${testId}] Failed to fetch website: ${fetchErrorReason}`);
    }

    if (!fetchSuccess || websiteHtml.length < 100) {
      console.error(`[${testId}] CRITICAL: Cannot analyze website - fetch failed`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to access website",
          errorType: "fetch_failed",
          details: fetchErrorReason || "The website could not be reached. Please check the URL and try again.",
          testId,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const spaMarkers = ['id="root"', 'id="app"', "__NEXT_DATA__", "window.__NUXT__", "data-reactroot"];
    const hasSPAMarker = spaMarkers.some((marker) => websiteHtml.includes(marker));

    let textContent = websiteHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    let meaningfulTextLength = textContent.length;
    let isLikelyJSRendered = hasSPAMarker && meaningfulTextLength < 500;

    console.log(
      `[${testId}] HTML length: ${websiteHtml.length}, Text length: ${meaningfulTextLength}, JS-rendered: ${isLikelyJSRendered}`,
    );

    if (isLikelyJSRendered && meaningfulTextLength < 500) {
      console.log(`[${testId}] 🔄 JS-rendered site detected - attempting headless browser fetch...`);

      try {
        const jinaUrl = `https://r.jina.ai/${validatedWebsite}`;
        const jinaResponse = await fetch(jinaUrl, {
          headers: {
            Accept: "text/html",
            "User-Agent": "Mozilla/5.0 (compatible; FoundIndex-Bot/1.0; +https://foundindex.com)",
          },
          signal: AbortSignal.timeout(30000),
        });

        if (jinaResponse.ok) {
          const renderedContent = await jinaResponse.text();
          console.log(`[${testId}] ✅ Jina.ai returned ${renderedContent.length} chars`);

          if (renderedContent.length > meaningfulTextLength) {
            textContent = renderedContent;
            meaningfulTextLength = textContent.length;
            isLikelyJSRendered = false;
            websiteHtml = `<!DOCTYPE html><html><head><title>${validatedWebsite}</title></head><body>${renderedContent}</body></html>`;
          }
        }
      } catch (jinaError) {
        console.warn(
          `[${testId}] ⚠️ Jina.ai fetch failed: ${jinaError instanceof Error ? jinaError.message : "Unknown"}`,
        );
      }
    }

    if (isLikelyJSRendered && meaningfulTextLength < 200) {
      console.warn(`[${testId}] CRITICAL: JS-rendered site with minimal content`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to analyze JavaScript-rendered website",
          errorType: "js_rendered_site",
          details:
            "This website uses JavaScript rendering. We couldn't extract meaningful content. Try enabling SSR or contact support.",
          testId,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`[${testId}] ===================`);
    console.log(`[${testId}] STEP 2: AI-Readiness Audit (Parallel)...`);
    console.log(`[${testId}] ===================`);

    const modelName = Deno.env.get("OPENAI_MODEL_NAME") || "gpt-4-turbo";
    console.log(`[${testId}] Using model: ${modelName}`);

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
            console.log(`[${testId}] Rate limit hit, retrying after 2s...`);
            await new Promise((r) => setTimeout(r, 2000));
            return callWithRetry(messages, retries - 1);
          }
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        return JSON.parse(content);
      } catch (error) {
        if (error instanceof Error && error.message.includes("429") && retries > 0) {
          await new Promise((r) => setTimeout(r, 2000));
          return callWithRetry(messages, retries - 1);
        }
        throw error;
      }
    }

    const extractedContent = websiteHtml.substring(0, 50000);

    const structuralPrompt = `Analyze this website's structure and content. Return ONLY valid JSON:

{
  "content_clarity_score": number (0-25),
  "discoverability_score": number (0-20),
  "technical_score": number (0-15)
}

Criteria:
- Content Clarity (0-25): Value proposition clear in first 100 words? Target audience explicit? Services/products clearly described?
- Discoverability (0-20): Critical info in first 2-3 screen sections? Clear headers? Scannable content?
- Technical (0-15): Semantic HTML? Title tag and meta description? Schema.org markup?

Website: ${validatedWebsite}
Content: ${extractedContent}

Return ONLY JSON, no markdown.`;

    const businessPrompt = `Analyze this business's credibility and positioning. Return ONLY valid JSON:

{
  "authority_score": number (0-15),
  "positioning_score": number (0-15),
  "recommendations": [array of 3-5 specific improvements]
}

Criteria:
- Authority (0-15): Portfolio/case studies? Client testimonials with attribution? Client logos? Specific results/metrics? Certifications?
- Positioning (0-15): Clear target customer? What makes them different? Who they're NOT for?
- Recommendations: List 3-5 specific missing elements

Website: ${validatedWebsite}
Content: ${extractedContent}

Return ONLY JSON, no markdown.`;

    console.log(`[${testId}] Running parallel OpenAI analysis...`);

    let structuralResult: any = null;
    let businessResult: any = null;
    let structuralError = false;
    let businessError = false;

    try {
      [structuralResult, businessResult] = await Promise.all([
        callWithRetry([{ role: "user", content: structuralPrompt }]).catch((err) => {
          console.error(`[${testId}] Structural analysis failed:`, err);
          structuralError = true;
          return null;
        }),
        callWithRetry([{ role: "user", content: businessPrompt }]).catch((err) => {
          console.error(`[${testId}] Business analysis failed:`, err);
          businessError = true;
          return null;
        }),
      ]);
    } catch (error) {
      console.error(`[${testId}] Parallel calls failed:`, error);
    }

    if (structuralError && businessError) {
      console.error(`[${testId}] CRITICAL: Both analysis calls failed`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "AI analysis temporarily unavailable. Please try again in 1-2 minutes.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const scores = {
      content_clarity_score: structuralResult?.content_clarity_score || 0,
      discoverability_score: structuralResult?.discoverability_score || 0,
      technical_score: structuralResult?.technical_score || 0,
      authority_score: businessResult?.authority_score || 0,
      positioning_score: businessResult?.positioning_score || 0,
      recommendations: businessResult?.recommendations || [],
    };

    const foundindex_score =
      scores.content_clarity_score +
      scores.discoverability_score +
      scores.authority_score +
      scores.technical_score +
      scores.positioning_score;

    let analysisStatus = "complete";
    let errorMessage = null;

    if (structuralError) {
      analysisStatus = "degraded";
      errorMessage = "structural_analysis_failed";
    } else if (businessError) {
      analysisStatus = "degraded";
      errorMessage = "business_analysis_failed";
    }

    console.log(`[${testId}] Analysis complete - Status: ${analysisStatus}, Score: ${foundindex_score}/100`);

    console.log(`[${testId}] ===================`);
    console.log(`[${testId}] STEP 3: Business type analysis...`);
    console.log(`[${testId}] ===================`);

    let businessType = validatedIndustry;
    let queries: string[] = [];

    try {
      const analysisPrompt = `Analyze this business: ${validatedWebsite}

Industry hint: ${validatedIndustry}

Determine:
1. Specific business type
2. 15 buyer-intent queries people would ask when looking for this

Return ONLY valid JSON:
{
  "business_type": "specific category",
  "queries": ["query 1", "query 2", ...]
}`;

      const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You analyze businesses and search behavior. Return ONLY valid JSON, no markdown.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        let analysisText = analysisData.choices[0].message.content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        try {
          const parsed = JSON.parse(analysisText);
          businessType = parsed.business_type || validatedIndustry;
          queries = parsed.queries || [];
        } catch (parseError) {
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            businessType = parsed.business_type || validatedIndustry;
            queries = parsed.queries || [];
          }
        }
      }

      if (!queries || queries.length < 10) {
        queries = industryQueries[validatedIndustry] || industryQueries.other;
        businessType = validatedIndustry;
      }
    } catch (error) {
      console.error(`[${testId}] Query generation failed:`, error);
      queries = industryQueries[validatedIndustry] || industryQueries.other;
    }

    console.log(`[${testId}] ===================`);
    console.log(`[${testId}] STEP 4: ChatGPT Visibility Test (OPTIMIZED - Parallel Batches)...`);
    console.log(`[${testId}] ===================`);
    console.log(`[${testId}] Testing ${queries.length} queries in parallel batches of 5...`);

    let totalRecommendations = 0;
    const queryResults = [];

    // OPTIMIZED: Process queries in parallel batches of 5
    const BATCH_SIZE = 5;
    const batches = [];

    for (let i = 0; i < queries.length; i += BATCH_SIZE) {
      batches.push(queries.slice(i, i + BATCH_SIZE));
    }

    console.log(`[${testId}] Created ${batches.length} batches of up to ${BATCH_SIZE} queries each`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`[${testId}] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} queries)...`);

      // Process all queries in this batch in parallel
      const batchPromises = batch.map(async (query, indexInBatch) => {
        const queryNumber = batchIndex * BATCH_SIZE + indexInBatch + 1;

        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant that recommends software and services. Provide specific recommendations.",
                },
                {
                  role: "user",
                  content: query,
                },
              ],
              max_tokens: 300,
              temperature: 0.7,
            }),
          });

          const data = await response.json();
          const aiResponse = data.choices[0].message.content;

          // Check if website is mentioned
          let domain = validatedWebsite;
          try {
            const url = new URL(validatedWebsite);
            domain = url.hostname.replace(/^www\./, "");
          } catch (e) {
            domain = validatedWebsite.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
          }

          const brandName = domain.split(".")[0];
          const responseText = aiResponse.toLowerCase();

          const domainFound = responseText.includes(domain.toLowerCase());
          const brandFound = responseText.includes(brandName.toLowerCase());
          const brandWithSpaces = brandName.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
          const brandSpacedFound = responseText.includes(brandWithSpaces);

          const wasRecommended = domainFound || brandFound || brandSpacedFound;

          // Extract context snippet
          let contextSnippet = aiResponse.substring(0, 400);
          if (wasRecommended) {
            const sentences = aiResponse.split(/[.!?]\s+/);
            const relevantSentence = sentences.find(
              (s: string) =>
                s.toLowerCase().includes(brandName.toLowerCase()) || s.toLowerCase().includes(domain.toLowerCase()),
            );
            if (relevantSentence && relevantSentence.length < 400) {
              contextSnippet = relevantSentence;
            }
          }

          return {
            query_number: queryNumber,
            query_text: query,
            engine: "ChatGPT",
            was_recommended: wasRecommended,
            context_snippet: contextSnippet,
            recommendation_position: wasRecommended ? 1 : null,
            quality_rating: wasRecommended ? "high" : "none",
          };
        } catch (error) {
          console.error(`[${testId}] Query ${queryNumber} failed:`, error);
          return {
            query_number: queryNumber,
            query_text: query,
            engine: "ChatGPT",
            was_recommended: false,
            context_snippet: "Error occurred during testing",
            recommendation_position: null,
            quality_rating: "none",
          };
        }
      });

      // Wait for all queries in this batch to complete
      const batchResults = await Promise.all(batchPromises);

      // Count recommendations and add to results
      batchResults.forEach((result) => {
        if (result.was_recommended) {
          totalRecommendations++;
        }
        queryResults.push(result);
      });

      console.log(
        `[${testId}] Batch ${batchIndex + 1}/${batches.length} complete - Total recommendations so far: ${totalRecommendations}/${queryResults.length}`,
      );
    }

    console.log(`[${testId}] ✅ All ${queries.length} queries completed in ${batches.length} parallel batches`);
    console.log(`[${testId}] Final: ${totalRecommendations}/${queries.length} recommendations`);

    const recommendationRate = (totalRecommendations / queries.length) * 100;
    const chatgptScore = Math.round(recommendationRate);

    // Record submission
    const { error: insertError } = await supabaseAdmin.from("test_submissions").insert({
      email: validatedEmail,
      ip_address: clientIP,
      test_id: testId,
      created_at: testDate,
    });

    if (insertError) {
      console.error(`[${testId}] Failed to record submission:`, insertError);
    }

    // Store in Airtable
    console.log(`[${testId}] Writing results to Airtable...`);
    const airtableApiKey = Deno.env.get("AIRTABLE_API_KEY");
    const airtableBaseId = Deno.env.get("AIRTABLE_BASE_ID");

    const testRecordFields: Record<string, any> = {
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
      recommendations: JSON.stringify(scores.recommendations, null, 2),
      business_type: businessType,
      generated_queries: JSON.stringify(queries, null, 2),
      chatgpt_score: chatgptScore,
      claude_score: 0,
      perplexity_score: 0,
      recommendations_count: totalRecommendations,
      recommendation_rate: parseFloat(recommendationRate.toFixed(3)),
    };

    const testRecordResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Tests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields: testRecordFields }),
    });

    if (!testRecordResponse.ok) {
      const errorText = await testRecordResponse.text();
      console.error(`[${testId}] Airtable write failed:`, errorText);
    } else {
      console.log(`[${testId}] ✅ Airtable write successful`);
    }

    // Store query results in batches
    const airtableBatchSize = 10;
    for (let i = 0; i < queryResults.length; i += airtableBatchSize) {
      const batch = queryResults.slice(i, i + airtableBatchSize);

      await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Query_Results`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${airtableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: batch.map((result) => ({
            fields: {
              test_id: testId,
              ...result,
            },
          })),
        }),
      });
    }

    console.log(`[${testId}] ✅ SUCCESS! AI-Readiness: ${foundindex_score}/100, ChatGPT: ${chatgptScore}%`);

    return new Response(
      JSON.stringify({
        success: true,
        testId,
        score: foundindex_score,
        foundIndexScore: chatgptScore,
        totalRecommendations,
        totalQueries: queries.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Request error:", error);

    if (
      error instanceof Error &&
      (error.message.includes("Email") || error.message.includes("Website") || error.message.includes("Industry"))
    ) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
