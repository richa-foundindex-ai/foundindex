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
    const { email, source } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const AIRTABLE_API_KEY = Deno.env.get("AIRTABLE_API_KEY");
    const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error("❌ Missing Airtable credentials");
      return new Response(JSON.stringify({ error: "Airtable configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("📤 Sending to Airtable:", { email, source: source || "v2_waitlist" });

    // SEND TO AIRTABLE - ONLY email and source
    // signup_date will auto-populate because it's a "Created time" field
    const airtableResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Tracking_Waitlist`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              email: email,
              source: source || "v2_waitlist",
            },
          },
        ],
      }),
    });

    const responseText = await airtableResponse.text();
    console.log("📥 Airtable response:", responseText);

    if (!airtableResponse.ok) {
      console.error("❌ Airtable API error:", airtableResponse.status, responseText);
      return new Response(
        JSON.stringify({
          error: `Airtable API error: ${airtableResponse.status}`,
          details: responseText,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("✅ Waitlist signup saved to Airtable");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thanks! We'll notify you when v2 launches.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({
        error: "Server error",
        message: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
