import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("[submit-insights] Received:", body);

    const {
      url_tested,
      situation_selected,
      problem_description,
      email_consent,
      email,
      user_email,
    } = body;

    // Validate required fields
    if (!url_tested || !situation_selected || !user_email) {
      console.error("[submit-insights] Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: url_tested, situation_selected, user_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate situation_selected is one of the expected values
    const validSituations = [
      "AI misunderstands what our business actually does",
      "AI understands us, but wouldn't confidently recommend us",
      "AI likely surfaces competitors more clearly than us",
      "This confirms what I already suspected",
      "I'm not sure yet",
    ];

    if (!validSituations.includes(situation_selected)) {
      console.error("[submit-insights] Invalid situation selected:", situation_selected);
      return new Response(
        JSON.stringify({ error: "Invalid situation selected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate problem_description length if provided
    if (problem_description && problem_description.length > 120) {
      console.error("[submit-insights] Problem description too long:", problem_description.length);
      return new Response(
        JSON.stringify({ error: "Problem description must be 120 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert into database
    const { data, error: insertError } = await supabase
      .from("foundindex_insights")
      .insert({
        url_tested: url_tested.trim(),
        situation_selected,
        problem_description: problem_description?.trim() || null,
        email_consent: email_consent || false,
        email: email_consent && email ? email.trim().toLowerCase() : null,
        user_email: user_email.trim().toLowerCase(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("[submit-insights] Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save insights", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[submit-insights] Successfully saved:", data.id);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[submit-insights] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
