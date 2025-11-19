import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  testId: string;
  score: number;
  website: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, testId, score, website }: EmailRequest = await req.json();
    
    console.log('Sending email to:', to, 'Score:', score);

    // For now, just log the email that would be sent
    // In production, you would integrate with a service like Resend or SendGrid
    const emailContent = {
      to,
      subject: `Your FoundIndex Score: ${score}/100`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1A1A1A;">Your FoundIndex: ${score}/100</h1>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Thank you for testing <strong>${website}</strong> with FoundIndex!
            </p>
            
            <div style="background: #F9FAFB; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">Your Score: ${score}/100</p>
              <p style="margin: 10px 0 0 0; color: #374151;">
                ${score < 30 ? 'Low visibility - most AI-driven buyers won\'t discover you' : 
                  score < 50 ? 'Emerging visibility - you\'re found occasionally but competitors dominate' :
                  score < 70 ? 'Strong visibility - AI recommends you regularly' :
                  'Excellent visibility - you\'re a top recommendation'}
              </p>
            </div>
            
            <h2 style="color: #1A1A1A; font-size: 20px;">Top Opportunities:</h2>
            <ul style="color: #374151; line-height: 1.8;">
              <li>Content freshness (+15 pts)</li>
              <li>FAQ schema (+12 pts)</li>
              <li>Reddit presence (+10 pts)</li>
            </ul>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '')}/results?testId=${testId}" 
                 style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Full Report
              </a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
            
            <p style="color: #6B7280; font-size: 14px;">
              Want to track your FoundIndex over time?<br>
              <a href="#" style="color: #DC2626;">Start Tracking</a> - $49/mo, unlimited tests + competitor alerts
            </p>
            
            <p style="color: #6B7280; font-size: 12px; margin-top: 20px;">
              Questions? Reply to this email.<br>
              - FoundIndex Team
            </p>
          </body>
        </html>
      `
    };

    console.log('Email prepared:', emailContent);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email notification prepared',
      email: emailContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-email:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
