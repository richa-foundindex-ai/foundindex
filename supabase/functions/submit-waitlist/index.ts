import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get email from request
    const requestData = await req.json();
    const email = requestData.email;
    const source = requestData.source || "v2_waitlist";

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Airtable credentials
    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error("Missing Airtable credentials");
      return new Response(JSON.stringify({ error: "Configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Submitting to Airtable:", email, source);

    // Send to Airtable - EXACT format that worked in PowerShell
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tracking_Waitlist`;

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

    const airtableResponse = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(airtableBody),
    });

    const responseData = await airtableResponse.json();

    if (!airtableResponse.ok) {
      console.error("Airtable error:", responseData);
      return new Response(
        JSON.stringify({
          error: "Failed to save",
          details: responseData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Success! Saved to Airtable:", responseData);

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Thanks! We'll notify you when v2 launches.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Server error",
        message: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
