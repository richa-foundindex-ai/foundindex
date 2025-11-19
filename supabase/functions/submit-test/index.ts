import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestSubmission {
  email: string;
  website: string;
  industry: string;
}

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
    console.log('Test submission received:', { email, website, industry });

    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Normalize website URL
    let normalizedUrl = website.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Generate test ID
    const testId = crypto.randomUUID();
    const testDate = new Date().toISOString();

    // Get queries for industry
    const queries = industryQueries[industry] || industryQueries.other;
    
    // Test with OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    let totalRecommendations = 0;
    const queryResults = [];

    console.log(`Testing ${queries.length} queries...`);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`Query ${i + 1}/${queries.length}: ${query}`);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
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
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Check if website is mentioned (domain matching)
        const domain = normalizedUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        const wasRecommended = aiResponse.toLowerCase().includes(domain.toLowerCase());
        
        if (wasRecommended) {
          totalRecommendations++;
        }

        queryResults.push({
          query_number: i + 1,
          query_text: query,
          engine: 'ChatGPT',
          was_recommended: wasRecommended,
          context_snippet: aiResponse.substring(0, 200),
          recommendation_position: wasRecommended ? 1 : null,
          quality_rating: wasRecommended ? 'high' : 'none'
        });

        console.log(`Query ${i + 1}: ${wasRecommended ? 'Found' : 'Not found'}`);
      } catch (error) {
        console.error(`Error testing query ${i + 1}:`, error);
        queryResults.push({
          query_number: i + 1,
          query_text: query,
          engine: 'ChatGPT',
          was_recommended: false,
          context_snippet: 'Error occurred during testing',
          recommendation_position: null,
          quality_rating: 'none'
        });
      }
    }

    // Calculate scores
    const recommendationRate = (totalRecommendations / queries.length) * 100;
    const foundIndexScore = Math.round(recommendationRate);

    console.log(`Test complete: ${totalRecommendations}/${queries.length} recommendations (${foundIndexScore}%)`);

    // Store in Airtable
    const airtableApiKey = Deno.env.get('AIRTABLE_API_KEY');
    const airtableBaseId = Deno.env.get('AIRTABLE_BASE_ID');

    // Store test record
    await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Tests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          test_id: testId,
          user_email: email,
          website_url: normalizedUrl,
          industry: industry,
          test_date: testDate,
          foundindex_score: foundIndexScore,
          chatgpt_score: foundIndexScore,
          claude_score: 0,
          perplexity_score: 0,
          recommendations_count: totalRecommendations,
          recommendation_rate: recommendationRate
        }
      })
    });

    // Store query results in batches
    const batchSize = 10;
    for (let i = 0; i < queryResults.length; i += batchSize) {
      const batch = queryResults.slice(i, i + batchSize);
      await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Query_Results`, {
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
    }

    console.log('Results stored in Airtable');

    // Send email notification
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          testId: testId,
          score: foundIndexScore,
          website: normalizedUrl
        })
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
    }

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
    console.error('Error in submit-test:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
