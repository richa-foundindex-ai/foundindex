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
    // Simple health check without exposing configuration details
    const response = {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };

    console.log('[Health Check] OK');

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Health Check] Error:', error);
    
    return new Response(JSON.stringify({ 
      status: "error",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
