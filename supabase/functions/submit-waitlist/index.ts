import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== SUBMIT-WAITLIST FUNCTION CALLED ===");

  if (req.method === "OPTIONS") {
    console.log("CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("📨 Request body received:", requestBody);

    const { email, source } = requestBody;

    if (!email) {
      console.log("❌ No email provided");
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Airtable configuration
    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");
    const AIRTABLE_TABLE_NAME = "Tracking_Waitlist";

    console.log("🔧 Environment check:", {
      hasApiKey: !!AIRTABLE_API_KEY,
      hasBaseId: !!AIRTABLE_BASE_ID,
      tableName: AIRTABLE_TABLE_NAME,
    });

    if (!AIRTABLE_API_KEY) {
      console.error("❌ AIRTABLE_API_KEY is missing");
      return new Response(JSON.stringify({ error: "AIRTABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!AIRTABLE_BASE_ID) {
      console.error("❌ AIRTABLE_BASE_ID is missing");
      return new Response(JSON.stringify({ error: "AIRTABLE_BASE_ID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Submit to Airtable
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    const airtablePayload = {
      records: [
        {
          fields: {
            email: email.trim(),
            source: source || "v2_waitlist",
          },
        },
      ],
    };

    console.log("📤 Sending to Airtable URL:", airtableUrl);
    console.log("📤 Airtable payload:", JSON.stringify(airtablePayload, null, 2));

    const airtableResponse = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(airtablePayload),
    });

    console.log("📥 Airtable response status:", airtableResponse.status);
    console.log("📥 Airtable response headers:", Object.fromEntries(airtableResponse.headers.entries()));

    const responseText = await airtableResponse.text();
    console.log("📥 Airtable response body:", responseText);

    if (!airtableResponse.ok) {
      console.error("❌ Airtable API failed");

      // Try to parse error for more details
      try {
        const errorJson = JSON.parse(responseText);
        console.error("❌ Airtable error JSON:", JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error("❌ Airtable raw error:", responseText);
      }

      throw new Error(`Airtable API returned ${airtableResponse.status}: ${responseText}`);
    }

    console.log("✅ Success! Record created in Airtable");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("💥 Final catch block error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
