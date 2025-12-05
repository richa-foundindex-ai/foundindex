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

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Input length limits
const MAX_TEXT_LENGTH = 1000;
const MAX_EMAIL_LENGTH = 255;
const MAX_URL_LENGTH = 500;

function checkRateLimit(ip: string): { allowed: boolean; remainingRequests: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remainingRequests: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remainingRequests: 0 };
  }

  record.count++;
  return { allowed: true, remainingRequests: MAX_REQUESTS_PER_WINDOW - record.count };
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
    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      console.log("[submit-feedback] Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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

    // Input length validation
    if (email.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Email must be less than ${MAX_EMAIL_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (website && website.length > MAX_URL_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Website URL must be less than ${MAX_URL_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (surprisingResult.length > MAX_TEXT_LENGTH || describeToColleague.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text fields must be less than ${MAX_TEXT_LENGTH} characters` }),
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

    console.log("[submit-feedback] Inserting feedback", { testId, website: website?.substring(0, 30) });

    const { error } = await supabaseAdmin.from("feedback").insert({
      test_id: testId.substring(0, 100),
      score,
      website: website.trim().substring(0, MAX_URL_LENGTH),
      surprising_result: surprisingResult.trim().substring(0, MAX_TEXT_LENGTH),
      describe_to_colleague: describeToColleague.trim().substring(0, MAX_TEXT_LENGTH),
      preventing_improvements: preventingImprovements.trim().substring(0, MAX_TEXT_LENGTH),
      user_type: userType.trim().substring(0, 100),
      email: trimmedEmail.substring(0, MAX_EMAIL_LENGTH),
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
    console.error("[submit-feedback] Unexpected error");
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
};

serve(handler);
