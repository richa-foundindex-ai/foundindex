import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
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
      console.error('Invalid website URL:', website);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid website URL' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingApplication, error: checkError } = await supabase
      .from('beta_applications')
      .select('id')
      .eq('email', email)
      .single();

    if (existingApplication) {
      console.log('Duplicate application attempt:', email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'An application with this email already exists' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }

    // Insert the application
    const { data, error } = await supabase
      .from('beta_applications')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        website: website.trim(),
        content_type: contentType,
        why_apply: whyApply?.trim() || null,
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
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});