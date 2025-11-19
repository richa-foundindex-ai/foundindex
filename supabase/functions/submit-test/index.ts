import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestSubmission {
  email: string;
  website: string;
  industry: string;
}

// Input validation schemas
const ALLOWED_INDUSTRIES = ['saas', 'financial', 'ecommerce', 'professional', 'healthcare', 'other'];

const validateEmail = (email: string): string => {
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 255) {
    throw new Error('Email must be less than 255 characters');
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error('Invalid email format');
  }
  return trimmed;
};

const validateWebsite = (website: string): string => {
  const trimmed = website.trim();
  if (trimmed.length > 500) {
    throw new Error('Website URL must be less than 500 characters');
  }
  
  let normalized = trimmed;
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  
  try {
    const url = new URL(normalized);
    if (!url.hostname || url.hostname.length < 3) {
      throw new Error('Invalid domain');
    }
    return normalized;
  } catch {
    throw new Error('Invalid website URL format');
  }
};

const validateIndustry = (industry: string): string => {
  if (!ALLOWED_INDUSTRIES.includes(industry)) {
    throw new Error('Invalid industry. Must be one of: ' + ALLOWED_INDUSTRIES.join(', '));
  }
  return industry;
};

const industryQueries: Record<string, string[]> = {
  saas: [
    "best project management software for remote teams",
    "top collaboration tools for startups",
    "recommended CRM platforms for small business",
    "best workflow automation software",
    "top productivity tools for distributed teams",
    "best SaaS solutions for team communication",
    "recommended cloud-based project tools",
    "top software for agile teams",
    "best tools for remote work collaboration",
    "recommended software for startup growth",
    "top platforms for team productivity",
    "best SaaS tools for business operations",
    "recommended solutions for workflow management",
    "top software for project tracking",
    "best cloud tools for team collaboration"
  ],
  financial: [
    "best accounting software for small business",
    "top financial planning tools",
    "recommended investment platforms",
    "best budgeting software for families",
    "top fintech solutions for businesses",
    "best tools for financial management",
    "recommended platforms for expense tracking",
    "top software for bookkeeping",
    "best solutions for financial analytics",
    "recommended tools for portfolio management",
    "top platforms for payment processing",
    "best software for financial reporting",
    "recommended solutions for tax management",
    "top tools for invoicing",
    "best platforms for financial planning"
  ],
  ecommerce: [
    "best e-commerce platforms for startups",
    "top online store builders",
    "recommended shopping cart software",
    "best solutions for online retail",
    "top platforms for dropshipping",
    "best tools for e-commerce marketing",
    "recommended software for inventory management",
    "top solutions for online payments",
    "best platforms for digital products",
    "recommended tools for store optimization",
    "top e-commerce solutions for small business",
    "best software for product catalogs",
    "recommended platforms for multi-channel selling",
    "top tools for order fulfillment",
    "best solutions for customer reviews"
  ],
  professional: [
    "best software for professional services",
    "top tools for consulting firms",
    "recommended platforms for service businesses",
    "best solutions for client management",
    "top software for professional scheduling",
    "best tools for time tracking professionals",
    "recommended platforms for service delivery",
    "top solutions for professional billing",
    "best software for contract management",
    "recommended tools for professional collaboration",
    "top platforms for service automation",
    "best solutions for client communication",
    "recommended software for professional reporting",
    "top tools for resource planning",
    "best platforms for professional workflows"
  ],
  healthcare: [
    "best healthcare management software",
    "top platforms for medical practices",
    "recommended EHR systems",
    "best solutions for patient management",
    "top software for healthcare providers",
    "best tools for medical scheduling",
    "recommended platforms for telehealth",
    "top solutions for healthcare billing",
    "best software for patient records",
    "recommended tools for healthcare analytics",
    "top platforms for medical compliance",
    "best solutions for healthcare communication",
    "recommended software for practice management",
    "top tools for healthcare workflows",
    "best platforms for patient engagement"
  ],
  other: [
    "best software solutions for businesses",
    "top tools for operations",
    "recommended platforms for growth",
    "best solutions for efficiency",
    "top software for business management",
    "best tools for productivity",
    "recommended platforms for automation",
    "top solutions for communication",
    "best software for collaboration",
    "recommended tools for analytics",
    "top platforms for customer service",
    "best solutions for workflow",
    "recommended software for reporting",
    "top tools for data management",
    "best platforms for business operations"
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, website, industry }: TestSubmission = await req.json();

    // Validate inputs
    const validatedEmail = validateEmail(email);
    const validatedWebsite = validateWebsite(website);
    const validatedIndustry = validateIndustry(industry);

    console.log('Processing test for industry:', validatedIndustry);

    // Initialize Supabase client with service role for rate limiting
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limit: 3 tests per email per month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: emailCount, error: emailCountError } = await supabaseAdmin
      .from('test_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('email', validatedEmail)
      .gte('created_at', startOfMonth.toISOString());

    if (emailCountError) {
      console.error('Rate limit check error:', emailCountError);
      throw new Error('Unable to process request');
    }

    if (emailCount !== null && emailCount >= 3) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. You can test 3 websites per month. Please try again next month.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check IP-based rate limit: 100 tests per IP per day (increased for testing - reduce to 10 for production)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { count: ipCount, error: ipCountError } = await supabaseAdmin
      .from('test_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', clientIP)
      .gte('created_at', oneDayAgo.toISOString());

    if (ipCountError) {
      console.error('IP rate limit check error:', ipCountError);
      throw new Error('Unable to process request');
    }

    if (ipCount !== null && ipCount >= 100) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Too many requests from your network. Please try again later.' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate test ID
    const testId = crypto.randomUUID();
    const testDate = new Date().toISOString();

    // Get queries for industry
    const queries = industryQueries[validatedIndustry] || industryQueries.other;
    
    // Test with OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let totalRecommendations = 0;
    const queryResults = [];

    console.log(`[${testId}] Starting OpenAI calls for ${queries.length} queries...`);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`[${testId}] Processing query ${i + 1}/${queries.length}...`);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that recommends software and services. Provide specific recommendations with brief explanations.'
              },
              {
                role: 'user',
                content: query
              }
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Check if website is mentioned (domain matching)
        const domain = validatedWebsite.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        const wasRecommended = aiResponse.toLowerCase().includes(domain.toLowerCase());
        
        if (wasRecommended) {
          totalRecommendations++;
        }

        queryResults.push({
          query_number: i + 1,
          query_text: query,
          ai_engine: 'ChatGPT',
          was_recommended: wasRecommended,
          context_snippet: aiResponse.substring(0, 200),
          recommendation_position: wasRecommended ? 1 : null,
          quality_rating: wasRecommended ? 'high' : 'none'
        });

        console.log(`[${testId}] Completed query ${i + 1}/${queries.length} - Recommended: ${wasRecommended}`);
        if ((i + 1) % 5 === 0 || i + 1 === queries.length) {
          console.log(`[${testId}] Progress: ${i + 1}/${queries.length} queries complete`);
        }
      } catch (error) {
        console.error(`[${testId}] Error processing query ${i + 1}:`, error);
        queryResults.push({
          query_number: i + 1,
          query_text: query,
          ai_engine: 'ChatGPT',
          was_recommended: false,
          context_snippet: 'Error occurred during testing',
          recommendation_position: null,
          quality_rating: 'none'
        });
      }
    }

    console.log(`[${testId}] All queries completed. Total recommendations: ${totalRecommendations}/${queries.length}`);

    // Calculate scores
    const recommendationRate = (totalRecommendations / queries.length) * 100;
    const foundIndexScore = Math.round(recommendationRate);

    console.log(`[${testId}] Test complete: ${totalRecommendations}/${queries.length} recommendations`);

    // Record submission in database for rate limiting
    const { error: insertError } = await supabaseAdmin
      .from('test_submissions')
      .insert({
        email: validatedEmail,
        ip_address: clientIP,
        test_id: testId,
        created_at: testDate
      });

    if (insertError) {
      console.error(`[${testId}] Failed to record submission:`, insertError);
    }

    // Store in Airtable
    console.log(`[${testId}] Writing results to Airtable...`);
    const airtableApiKey = Deno.env.get('AIRTABLE_API_KEY');
    const airtableBaseId = Deno.env.get('AIRTABLE_BASE_ID');

    console.log(`[${testId}] Airtable config - Base ID exists: ${!!airtableBaseId}, API Key exists: ${!!airtableApiKey}`);

    // Store test record
    const testRecordFields = {
      test_id: testId,
      user_email: validatedEmail,
      website_url: validatedWebsite,
      industry: validatedIndustry,
      test_date: testDate,
      foundindex_score: foundIndexScore,
      chatgpt_score: foundIndexScore,
      recommendations_count: totalRecommendations,
      recommendation_rate: recommendationRate
    };
    
    console.log(`[${testId}] Writing to Airtable Tests table with fields:`, testRecordFields);

    const testRecordResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Tests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: testRecordFields
      })
    });

    console.log(`[${testId}] Airtable Tests write - Status: ${testRecordResponse.status}`);
    
    if (!testRecordResponse.ok) {
      const errorText = await testRecordResponse.text();
      console.error(`[${testId}] Airtable Tests write FAILED - Status: ${testRecordResponse.status}, Response:`, errorText);
      throw new Error(`Airtable Tests write failed: ${errorText}`);
    }
    
    const testRecordData = await testRecordResponse.json();
    console.log(`[${testId}] Airtable Tests write SUCCESS - Status: ${testRecordResponse.status}, Response:`, JSON.stringify(testRecordData));

    // Store query results in batches
    const batchSize = 10;
    console.log(`[${testId}] Writing ${queryResults.length} query results in batches of ${batchSize}...`);
    
    for (let i = 0; i < queryResults.length; i += batchSize) {
      const batch = queryResults.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      console.log(`[${testId}] Writing batch ${batchNumber} (${batch.length} records)...`);
      console.log(`[${testId}] Batch ${batchNumber} sample fields:`, batch[0]);
      
      const batchResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Query_Results`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: batch.map(result => ({
            fields: {
              test_id: testId,
              ...result
            }
          }))
        })
      });

      console.log(`[${testId}] Batch ${batchNumber} - Status: ${batchResponse.status}`);
      
      if (!batchResponse.ok) {
        const errorText = await batchResponse.text();
        console.error(`[${testId}] Airtable Query_Results batch ${batchNumber} write FAILED - Status: ${batchResponse.status}, Response:`, errorText);
        throw new Error(`Airtable Query_Results write failed: ${errorText}`);
      }
      
      const batchData = await batchResponse.json();
      console.log(`[${testId}] Batch ${batchNumber} SUCCESS - Status: ${batchResponse.status}, Wrote ${batchData.records?.length || 0} records`);
    }

    console.log(`[${testId}] All ${queryResults.length} query results stored successfully in Airtable`);

    // Send email notification using service role key
    console.log(`[${testId}] Sending email notification to ${validatedEmail}...`);
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: validatedEmail,
          testId: testId,
          score: foundIndexScore,
          website: validatedWebsite
        })
      });
      
      console.log(`[${testId}] Email sent successfully`);
    } catch (emailError) {
      console.error(`[${testId}] Email send failed:`, emailError);
    }

    console.log(`[${testId}] SUCCESS! Test ID: ${testId}, FoundIndex Score: ${foundIndexScore}`);

    return new Response(JSON.stringify({
      success: true,
      testId,
      foundIndexScore,
      totalRecommendations,
      totalQueries: queries.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Request processing error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error,
      raw: error
    });
    
    // Return specific validation errors
    if (error instanceof Error && 
        (error.message.includes('Email') || 
         error.message.includes('Website') || 
         error.message.includes('Industry') ||
         error.message.includes('Rate limit'))) {
      return new Response(JSON.stringify({ 
        error: error.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Return more detailed error for debugging
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
