import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const email = requestData.email;
    const source = requestData.source || "v2_waitlist";

    console.log("=== DEBUGGING INFO START ===");
    console.log("1. Received email:", email);
    console.log("2. Received source:", source);

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");

    console.log("3. Base ID:", AIRTABLE_BASE_ID);
    console.log("4. API Key exists:", AIRTABLE_API_KEY ? "YES" : "NO");

    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tracking_Waitlist`;
    console.log("5. Full URL:", airtableUrl);

    const airtableBody = {
      records: [
        {
          fields: {
            email: email,
            source: source,
          },
        },
      ],
    };

    console.log("6. Request body as string:");
    console.log(JSON.stringify(airtableBody, null, 2));

    const headers = {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    };

    console.log("7. Headers (without token):");
    console.log("   Content-Type:", headers["Content-Type"]);
    console.log("   Auth header starts with 'Bearer pat':", headers.Authorization.startsWith("Bearer pat"));

    console.log("8. About to call Airtable...");

    const airtableResponse = await fetch(airtableUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(airtableBody),
    });

    console.log("9. Airtable response status:", airtableResponse.status);

    const responseText = await airtableResponse.text();
    console.log("10. Airtable response body:");
    console.log(responseText);
    console.log("=== DEBUGGING INFO END ===");

    if (!airtableResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `Airtable API error: ${airtableResponse.status}`,
          details: responseText,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thanks! We'll notify you when v2 launches.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("CAUGHT ERROR:", error);
    console.error("Error type:", typeof error);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

    return new Response(
      JSON.stringify({
        error: "Server error",
        message: String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
