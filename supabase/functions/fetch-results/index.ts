import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testId } = await req.json();

    if (!testId) {
      return new Response(JSON.stringify({ error: "Test ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof testId !== "string" || !isValidUUID(testId)) {
      console.warn(`[fetch-results] Invalid test ID format rejected: ${testId}`);
      return new Response(JSON.stringify({ error: "Invalid test ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[fetch-results] Fetching data for test ID: ${testId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[fetch-results] Missing Supabase credentials");
      throw new Error("Server configuration error");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: testData, error: testError } = await supabase
      .from("test_history")
      .select("*")
      .eq("test_id", testId)
      .single();

    if (testError) {
      console.error("[fetch-results] Database error:", testError);
      if (testError.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Test not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw testError;
    }

    if (!testData) {
      return new Response(JSON.stringify({ error: "Test not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[fetch-results] Found test: ${testData.test_id}, Score: ${testData.score}`);

    // Also fetch AI interpretation if available
    let aiInterpretation = null;
    try {
      const { data: interpretationData } = await supabase
        .from("ai_interpretations")
        .select("*")
        .eq("test_id", testId)
        .single();
      
      if (interpretationData) {
        aiInterpretation = {
          interpretation: interpretationData.ai_interpretation,
          confidenceScore: interpretationData.confidence_score,
          userFeedback: interpretationData.user_accuracy_feedback,
        };
        console.log(`[fetch-results] Found AI interpretation with confidence ${interpretationData.confidence_score}%`);
      }
    } catch (e) {
      // AI interpretation is optional, don't fail if not found
      console.log(`[fetch-results] No AI interpretation found for test ${testId}`);
    }

    const result = {
      testId: testData.test_id,
      website: testData.website,
      testType: testData.test_type,
      detectedType: testData.detected_type,
      score: testData.score,
      grade: testData.grade,
      categories: testData.categories || {},
      recommendations: testData.recommendations || [],
      createdAt: testData.created_at,
      aiInterpretation,
    };

    console.log(`[fetch-results] Successfully fetched results for test ${testId}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[fetch-results] Error:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred fetching results",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
