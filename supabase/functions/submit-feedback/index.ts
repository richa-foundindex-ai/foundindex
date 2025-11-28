import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  testId: string;
  score: number;
  website: string;
  surprisingResult: string;
  describeToColleague: string;
  preventingImprovements: string;
  userType: string;
  email: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("submit-feedback: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      testId,
      score,
      website,
      surprisingResult,
      describeToColleague,
      preventingImprovements,
      userType,
      email,
    }: FeedbackRequest = await req.json();

    if (!testId || !email || !surprisingResult || !describeToColleague) {
      return new Response(
        JSON.stringify({ error: "Required fields are missing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("[submit-feedback] Inserting feedback", { testId, website, email: trimmedEmail });

    const { error } = await supabaseAdmin.from("feedback").insert({
      test_id: testId,
      score,
      website: website.trim(),
      surprising_result: surprisingResult.trim(),
      describe_to_colleague: describeToColleague.trim(),
      preventing_improvements: preventingImprovements.trim(),
      user_type: userType.trim(),
      email: trimmedEmail,
    });

    if (error) {
      console.error("[submit-feedback] Insert error", error);
      return new Response(
        JSON.stringify({ error: "Failed to save feedback" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("✅ Feedback submitted successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("[submit-feedback] Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
};

serve(handler);
