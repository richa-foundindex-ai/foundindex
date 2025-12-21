import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BLOG_LIMIT = 3;
const ROLLING_WINDOW_DAYS = 7;

// ============================================================================
// TESTING MODE FLAG - Set to true to disable all rate limiting
// TODO: Set back to false before production launch
// ============================================================================
const TESTING_MODE = true;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // TESTING MODE - Return unlimited tests
  if (TESTING_MODE) {
    console.log("[get-blog-test-count] TESTING MODE ENABLED - returning unlimited tests");
    return new Response(
      JSON.stringify({
        success: true,
        testsUsed: 0,
        testsRemaining: 999,
        resetDate: null,
        limit: 999,
        windowDays: ROLLING_WINDOW_DAYS,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
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

    // Query test_history directly for blog tests in the rolling window
    // We need to match by joining with test_submissions to get IP
    // But since there's no FK, we'll query test_history for blog tests and match test_ids
    
    // First get all test_ids from this IP in the window
    const { data: submissions, error: subError } = await supabase
      .from("test_submissions")
      .select("test_id, created_at")
      .eq("ip_address", clientIp)
      .gte("created_at", windowStart.toISOString())
      .order("created_at", { ascending: true });

    if (subError) {
      console.error("[get-blog-test-count] Submissions query error:", subError);
    }

    console.log(`[get-blog-test-count] Submissions for IP ${clientIp}:`, submissions);

    if (!submissions || submissions.length === 0) {
      // No submissions from this IP
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

    // Get the test_ids
    const testIds = submissions.map(s => s.test_id);

    // Now query test_history to find which of these are blog tests
    const { data: blogTests, error: blogError } = await supabase
      .from("test_history")
      .select("test_id, created_at")
      .in("test_id", testIds)
      .eq("test_type", "blog")
      .order("created_at", { ascending: true });

    if (blogError) {
      console.error("[get-blog-test-count] Blog tests query error:", blogError);
    }

    console.log(`[get-blog-test-count] Blog tests found:`, blogTests);

    const testsUsed = blogTests?.length || 0;
    const testsRemaining = Math.max(0, BLOG_LIMIT - testsUsed);

    // Calculate reset date: oldest blog test + 7 days (rolling window)
    let resetDate: string | null = null;
    if (testsUsed >= BLOG_LIMIT && blogTests && blogTests.length > 0) {
      const oldestTest = new Date(blogTests[0].created_at);
      resetDate = new Date(oldestTest.getTime() + ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
      console.log(`[get-blog-test-count] Oldest blog test: ${oldestTest.toISOString()}, Reset date: ${resetDate}`);
    }

    console.log(`[get-blog-test-count] IP: ${clientIp}, Blog tests used: ${testsUsed}, Remaining: ${testsRemaining}, Reset: ${resetDate}`);

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
