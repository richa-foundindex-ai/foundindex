import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testId } = await req.json();

    if (!testId) {
      return new Response(JSON.stringify({ error: 'Test ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[fetch-results] Fetching data for test ID: ${testId}`);

    const airtableApiKey = Deno.env.get('AIRTABLE_API_KEY');
    const airtableBaseId = Deno.env.get('AIRTABLE_BASE_ID');

    // Fetch test record from Tests table
    const testsResponse = await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/Tests?filterByFormula={test_id}='${testId}'`,
      {
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
        },
      }
    );

    if (!testsResponse.ok) {
      console.error('[fetch-results] Failed to fetch Tests:', testsResponse.status);
      throw new Error('Failed to fetch test data');
    }

    const testsData = await testsResponse.json();
    console.log(`[fetch-results] Tests records found: ${testsData.records.length}`);

    if (testsData.records.length === 0) {
      return new Response(JSON.stringify({ error: 'Test not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const testRecord = testsData.records[0].fields;

    // Fetch query results from Query_Results table
    const queryResultsResponse = await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/Query_Results?filterByFormula={test_id}='${testId}'&sort[0][field]=query_number&sort[0][direction]=asc`,
      {
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
        },
      }
    );

    if (!queryResultsResponse.ok) {
      console.error('[fetch-results] Failed to fetch Query_Results:', queryResultsResponse.status);
      throw new Error('Failed to fetch query results');
    }

    const queryResultsData = await queryResultsResponse.json();
    console.log(`[fetch-results] Query_Results records found: ${queryResultsData.records.length}`);

    const queryResults = queryResultsData.records.map((record: any) => ({
      queryNumber: record.fields.query_number,
      queryText: record.fields.query_text,
      engine: record.fields.engine,
      wasRecommended: record.fields.was_recommended,
      contextSnippet: record.fields.context_snippet,
      recommendationPosition: record.fields.recommendation_position,
      qualityRating: record.fields.quality_rating,
    }));

    const result = {
      testId: testRecord.test_id,
      website: testRecord.website_url,
      industry: testRecord.industry,
      businessType: testRecord.business_type || testRecord.industry,
      generatedQueries: testRecord.generated_queries ? JSON.parse(testRecord.generated_queries) : [],
      testDate: testRecord.test_date,
      
      // AI Readiness Scores
      foundIndexScore: testRecord.foundindex_score,
      contentClarityScore: testRecord.content_clarity_score || 0,
      structuredDataScore: testRecord.structured_data_score || 0,
      authorityScore: testRecord.authority_score || 0,
      discoverabilityScore: testRecord.discoverability_score || 0,
      comparisonScore: testRecord.comparison_score || 0,
      analysisDetails: testRecord.analysis_details ? JSON.parse(testRecord.analysis_details) : {},
      recommendations: testRecord.recommendations ? JSON.parse(testRecord.recommendations) : [],
      
      // Query-Based Visibility
      chatgptScore: testRecord.chatgpt_score,
      claudeScore: testRecord.claude_score || 0,
      perplexityScore: testRecord.perplexity_score || 0,
      recommendationsCount: testRecord.recommendations_count,
      recommendationRate: testRecord.recommendation_rate,
      queryResults,
    };

    console.log(`[fetch-results] Successfully fetched results for test ${testId}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[fetch-results] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred fetching results',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
