import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const normalizeUrl = (url: string): string => {
  let normalized = url.trim().toLowerCase();
  
  // Remove any trailing slashes
  normalized = normalized.replace(/\/+$/, "");
  
  // If it doesn't start with http, add https://
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  
  // Extract just the domain
  try {
    const urlObj = new URL(normalized);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return normalized;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { website } = await req.json();

    if (!website) {
      return new Response(
        JSON.stringify({ error: "Website URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedUrl = normalizeUrl(website);
    console.log(`[check-existing-test] Checking for existing test of: ${normalizedUrl}`);

    const airtableApiKey = Deno.env.get("AIRTABLE_API_KEY");
    const airtableBaseId = Deno.env.get("AIRTABLE_BASE_ID");

    if (!airtableApiKey || !airtableBaseId) {
      console.error("[check-existing-test] Missing Airtable credentials");
      return new Response(
        JSON.stringify({ exists: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    // Search Airtable Tests table for this URL
    // Using filterByFormula to find matching URLs from the last 7 days
    const filterFormula = encodeURIComponent(
      `AND(SEARCH("${normalizedUrl}", LOWER({website})), IS_AFTER({test_date}, "${sevenDaysAgoISO}"))`
    );

    console.log(`[check-existing-test] Airtable filter: ${filterFormula}`);

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${airtableBaseId}/Tests?filterByFormula=${filterFormula}&sort[0][field]=test_date&sort[0][direction]=desc&maxRecords=1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${airtableApiKey}`,
        },
      }
    );

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      console.error(`[check-existing-test] Airtable error: ${errorText}`);
      return new Response(
        JSON.stringify({ exists: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const airtableData = await airtableResponse.json();
    console.log(`[check-existing-test] Found ${airtableData.records?.length || 0} matching records`);

    if (airtableData.records && airtableData.records.length > 0) {
      const record = airtableData.records[0];
      const fields = record.fields;

      console.log(`[check-existing-test] Found existing test: ${fields.test_id}, score: ${fields.found_index_score}`);

      return new Response(
        JSON.stringify({
          exists: true,
          testId: fields.test_id,
          score: fields.found_index_score,
          website: fields.website,
          testDate: fields.test_date,
          contentClarityScore: fields.content_clarity_score,
          discoverabilityScore: fields.discoverability_score,
          authorityScore: fields.authority_score,
          structuredDataScore: fields.structured_data_score,
          comparisonScore: fields.comparison_score,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ exists: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[check-existing-test] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ exists: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
