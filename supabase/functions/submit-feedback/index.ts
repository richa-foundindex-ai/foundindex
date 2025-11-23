import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log("📝 Submitting feedback to Airtable:", {
      testId,
      score,
      website,
      email,
    });

    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error("Airtable credentials not configured");
    }

    // Submit to Airtable Feedback table
    const requestBody = {
      fields: {
        "Test ID": testId,
        Score: score,
        Website: website,
        "Surprising Result": surprisingResult,
        "Describe to Colleague": describeToColleague,
        "Preventing Improvements": preventingImprovements,
        "User Type": userType,
        Email: email,
        Timestamp: new Date().toISOString(),
      },
    };

    console.log("🔍 Complete request body being sent to Airtable:");
    console.log(JSON.stringify(requestBody, null, 2));
    console.log("🔍 Field names:", Object.keys(requestBody.fields));

    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Feedback`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      console.error("❌ Airtable error:", errorText);
      throw new Error(`Airtable submission failed: ${errorText}`);
    }

    const result = await airtableResponse.json();
    console.log("✅ Feedback submitted successfully:", result.id);

    return new Response(
      JSON.stringify({ success: true, recordId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in submit-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
