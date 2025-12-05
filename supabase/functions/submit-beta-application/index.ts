import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Input length limits
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_URL_LENGTH = 500;
const MAX_TEXT_LENGTH = 1000;
const MAX_CONTENT_TYPE_LENGTH = 100;

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    const rateCheck = checkRateLimit(clientIP);
    if (!rateCheck.allowed) {
      console.log("[submit-beta-application] Rate limit exceeded for IP:", clientIP);
      return new Response(
        JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    console.log('Submit beta application function called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { name, email, website, contentType, whyApply, allowCaseStudy, commitmentConfirmed } = await req.json();

    // Validate required fields
    if (!name || !email || !website || !contentType) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Input length validation
    if (name.length > MAX_NAME_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Name must be less than ${MAX_NAME_LENGTH} characters` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (email.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Email must be less than ${MAX_EMAIL_LENGTH} characters` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (website.length > MAX_URL_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Website URL must be less than ${MAX_URL_LENGTH} characters` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (contentType.length > MAX_CONTENT_TYPE_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Content type must be less than ${MAX_CONTENT_TYPE_LENGTH} characters` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (whyApply && whyApply.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ success: false, error: `Why apply must be less than ${MAX_TEXT_LENGTH} characters` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email format' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(website);
    } catch {
      console.error('Invalid website URL');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid website URL' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingApplication } = await supabase
      .from('beta_applications')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingApplication) {
      console.log('Duplicate application attempt');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'An application with this email already exists' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }

    // Insert the application with truncated values
    const { data, error } = await supabase
      .from('beta_applications')
      .insert({
        name: name.trim().substring(0, MAX_NAME_LENGTH),
        email: email.toLowerCase().trim().substring(0, MAX_EMAIL_LENGTH),
        website: website.trim().substring(0, MAX_URL_LENGTH),
        content_type: contentType.substring(0, MAX_CONTENT_TYPE_LENGTH),
        why_apply: whyApply?.trim().substring(0, MAX_TEXT_LENGTH) || null,
        allow_case_study: allowCaseStudy || false,
        commitment_confirmed: commitmentConfirmed || false,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting application:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to submit application. Please try again.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Beta application submitted successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        applicationId: data.id,
        message: 'Application received! We\'ll respond within 48 hours.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
