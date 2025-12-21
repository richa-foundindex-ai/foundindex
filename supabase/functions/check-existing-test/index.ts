import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// TESTING MODE FLAG - Set to true to disable all rate limiting
// TODO: Set back to false before production launch
// ============================================================================
const TESTING_MODE = true;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { website } = await req.json();

    if (!website) {
      return new Response(
        JSON.stringify({ error: "Website URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TESTING MODE - Always allow re-testing
    if (TESTING_MODE) {
      console.log(`[check-existing-test] TESTING MODE ENABLED - allowing re-test of: ${website}`);
      return new Response(
        JSON.stringify({ exists: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Add production rate limit check logic here when TESTING_MODE is false
    // For now, default to allowing the test
    return new Response(
      JSON.stringify({ exists: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[check-existing-test] Error:", error);
    return new Response(
      JSON.stringify({ exists: false, error: "An error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});