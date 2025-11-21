import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  testId: string;
  score: number;
  website: string;
  accuracyRating: string;
  accuracyWhy?: string;
  firstRecommendation: string;
  improvement?: string;
  permissionLevel: "anonymous" | "named" | "private";
  userName?: string;
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
      accuracyRating,
      accuracyWhy,
      firstRecommendation,
      improvement,
      permissionLevel,
      userName,
      email,
    }: FeedbackRequest = await req.json();

    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error("Airtable credentials not configured");
    }

    // Submit to Airtable
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Feedback`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            "Test ID": testId,
            Score: score,
            Website: website,
            "Accuracy Rating": accuracyRating,
            "Accuracy Why": accuracyWhy || "",
            "First Recommendation": firstRecommendation,
            Improvement: improvement || "",
            "Permission Level": permissionLevel,
            "User Name": userName || "",
            Email: email,
            Timestamp: new Date().toISOString(),
          },
        }),
      }
    );

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      console.error("Airtable error:", errorText);
      throw new Error(`Airtable submission failed: ${errorText}`);
    }

    const result = await airtableResponse.json();
    console.log("Feedback submitted successfully:", result.id);

    return new Response(
      JSON.stringify({ success: true, recordId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-feedback function:", error);
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
