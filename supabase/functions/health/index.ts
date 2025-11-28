import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if critical environment variables are set
    const checks = {
      supabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      supabaseKey: !!Deno.env.get('SUPABASE_PUBLISHABLE_KEY'),
      openaiKey: !!Deno.env.get('OPENAI_API_KEY'),
      airtableKey: !!Deno.env.get('AIRTABLE_API_KEY'),
    };

    const allHealthy = Object.values(checks).every(check => check === true);

    const response = {
      status: allHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: Deno.env.get('DENO_DEPLOYMENT_ID') ? 'production' : 'development',
      checks,
    };

    console.log('[Health Check]', response);

    return new Response(JSON.stringify(response), {
      status: allHealthy ? 200 : 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Health Check] Error:', error);
    
    return new Response(JSON.stringify({ 
      status: "error",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
