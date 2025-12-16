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
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'URL is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize URL
    let baseUrl = url.trim();
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }
    
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/$/, '');
    
    // Extract just the domain
    const urlObj = new URL(baseUrl);
    const domain = `${urlObj.protocol}//${urlObj.host}`;

    console.log(`Validating llms.txt for domain: ${domain}`);

    // Paths to try in order
    const paths = [
      '/.well-known/llms.txt',
      '/llms.txt'
    ];

    let content: string | null = null;
    let foundPath: string | null = null;
    let lastError: string | null = null;
    let lastStatus: number | null = null;

    for (const path of paths) {
      const fullUrl = domain + path;
      console.log(`Trying: ${fullUrl}`);

      try {
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'FoundIndex-Validator/1.0',
            'Accept': 'text/plain, */*',
          },
          redirect: 'follow',
        });

        console.log(`Response status for ${fullUrl}: ${response.status}`);

        if (response.ok) {
          const text = await response.text();
          // Verify it looks like an llms.txt file
          if (text.includes('version:') || text.includes('site-purpose:') || text.includes('llms.txt')) {
            content = text;
            foundPath = path;
            console.log(`Found valid llms.txt at ${fullUrl}`);
            break;
          } else {
            console.log(`File at ${fullUrl} doesn't appear to be llms.txt`);
            lastError = 'File exists but doesn\'t appear to be a valid llms.txt';
            lastStatus = response.status;
          }
        } else {
          lastStatus = response.status;
          if (response.status === 404) {
            lastError = 'File not found (404)';
          } else if (response.status === 403) {
            lastError = 'Access forbidden (403)';
          } else if (response.status >= 500) {
            lastError = `Server error (${response.status})`;
          } else {
            lastError = `HTTP error (${response.status})`;
          }
        }
      } catch (fetchError) {
        console.error(`Fetch error for ${fullUrl}:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError.message : 'Connection failed';
        
        // Check for common network errors
        if (lastError.includes('ENOTFOUND') || lastError.includes('getaddrinfo')) {
          lastError = 'Domain not found - check the URL';
        } else if (lastError.includes('ECONNREFUSED')) {
          lastError = 'Connection refused by server';
        } else if (lastError.includes('ETIMEDOUT') || lastError.includes('timeout')) {
          lastError = 'Connection timed out';
        } else if (lastError.includes('certificate') || lastError.includes('SSL')) {
          lastError = 'SSL certificate error';
        }
      }
    }

    if (content && foundPath) {
      return new Response(JSON.stringify({
        success: true,
        content,
        foundPath,
        domain,
        pathsTried: paths,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: lastError || 'No llms.txt file found',
        status: lastStatus,
        domain,
        pathsTried: paths,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Validation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
