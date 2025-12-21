import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testId, feedback } = await req.json();

    // Validate testId
    if (!testId || typeof testId !== "string" || testId.trim() === "") {
      console.error("[submit-ai-feedback] Missing or invalid testId");
      return new Response(
        JSON.stringify({ error: "testId is required and must be a non-empty string" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate feedback value
    if (!feedback || !["accurate", "close", "wrong"].includes(feedback)) {
      console.error("[submit-ai-feedback] Invalid feedback value:", feedback);
      return new Response(
        JSON.stringify({ error: "feedback must be exactly one of: 'accurate', 'close', or 'wrong'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("[submit-ai-feedback] Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // First check if the record exists
    const { data: existingRecord, error: selectError } = await supabaseAdmin
      .from("ai_interpretations")
      .select("id")
      .eq("test_id", testId.trim())
      .maybeSingle();

    if (selectError) {
      console.error("[submit-ai-feedback] Database select error:", selectError);
      return new Response(
        JSON.stringify({ error: "Failed to verify test ID" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!existingRecord) {
      console.error("[submit-ai-feedback] Test ID not found:", testId);
      return new Response(
        JSON.stringify({ error: "Test ID not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update the ai_interpretations record with user feedback
    const { error: updateError } = await supabaseAdmin
      .from("ai_interpretations")
      .update({ user_accuracy_feedback: feedback })
      .eq("test_id", testId.trim());

    if (updateError) {
      console.error("[submit-ai-feedback] Database update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save feedback" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[submit-ai-feedback] Saved feedback '${feedback}' for test ${testId}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[submit-ai-feedback] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
