import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BLOG_LIMIT = 3;
const ROLLING_WINDOW_DAYS = 7;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for tracking
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || "unknown";

    console.log(`[get-blog-test-count] Request from IP: ${clientIp}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the rolling window start
    const windowStart = new Date(Date.now() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    // Query test_history for blog tests from this IP in the rolling window
    const { data: recentBlogTests, error } = await supabase
      .from("test_history")
      .select("created_at")
      .eq("test_type", "blog")
      .gte("created_at", windowStart.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[get-blog-test-count] Database error:", error);
      // Return default values on error
      return new Response(
        JSON.stringify({
          success: true,
          testsUsed: 0,
          testsRemaining: BLOG_LIMIT,
          resetDate: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const testsUsed = recentBlogTests?.length || 0;
    const testsRemaining = Math.max(0, BLOG_LIMIT - testsUsed);

    // Calculate reset date based on oldest test in window
    let resetDate: string | null = null;
    if (testsUsed >= BLOG_LIMIT && recentBlogTests && recentBlogTests.length > 0) {
      const oldestTest = new Date(recentBlogTests[0].created_at);
      resetDate = new Date(oldestTest.getTime() + ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
    }

    console.log(`[get-blog-test-count] IP: ${clientIp}, Used: ${testsUsed}, Remaining: ${testsRemaining}, Reset: ${resetDate}`);

    return new Response(
      JSON.stringify({
        success: true,
        testsUsed,
        testsRemaining,
        resetDate,
        limit: BLOG_LIMIT,
        windowDays: ROLLING_WINDOW_DAYS,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[get-blog-test-count] Error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to get blog test count",
        testsUsed: 0,
        testsRemaining: BLOG_LIMIT,
        resetDate: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
