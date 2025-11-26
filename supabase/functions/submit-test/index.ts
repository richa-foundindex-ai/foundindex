import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestSubmission {
  email?: string;
  website: string;
  industry?: string;
}

// Input validation schemas
const ALLOWED_INDUSTRIES = ["saas", "financial", "ecommerce", "professional", "healthcare", "other"];

const validateEmail = (email: string | undefined): string => {
  if (!email) {
    // Generate anonymous email with timestamp
    return `anonymous-${Date.now()}@foundindex.local`;
  }
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 255) {
    throw new Error("Email must be less than 255 characters");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email format");
  }
  return trimmed;
};

const normalizeUrl = (url: string): string => {
  let normalized = url.trim().toLowerCase();

  // Remove any trailing slashes
  normalized = normalized.replace(/\/+$/, "");

  // If it doesn't start with http, add https://
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }

  return normalized;
};

const validateWebsite = (website: string): string => {
  const trimmed = website.trim();
  if (trimmed.length === 0) {
    throw new Error("Please enter a website URL");
  }

  // Use the normalizeUrl function we just fixed
  const normalized = normalizeUrl(trimmed);

  // Simple check - if it starts with https:// and has a dot, it's probably valid
  if (normalized.startsWith("https://") && normalized.includes(".")) {
    return normalized;
  }

  throw new Error('Please enter a valid website URL (like "slack.com")');
};

const validateIndustry = (industry: string | undefined): string => {
  if (!industry) {
    // Default to 'other' when not provided
    return "other";
  }
  if (!ALLOWED_INDUSTRIES.includes(industry)) {
    throw new Error("Invalid industry. Must be one of: " + ALLOWED_INDUSTRIES.join(", "));
  }
  return industry;
};

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
    "best cloud tools for team collaboration",
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
    "best platforms for financial planning",
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
    "best solutions for customer reviews",
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
    "best platforms for professional workflows",
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
    "best platforms for patient engagement",
  ],
  beauty: [
    "best organic skincare brands",
    "top cruelty-free makeup products",
    "recommended natural beauty products",
    "best anti-aging skincare solutions",
    "top beauty brands for sensitive skin",
    "best hair care products for damaged hair",
    "recommended cosmetics for daily use",
    "top beauty subscription boxes",
    "best natural beauty remedies",
    "recommended skincare routines",
    "top makeup brands for beginners",
    "best beauty tools and accessories",
    "recommended facial care products",
    "top wellness beauty products",
    "best beauty products for glowing skin",
  ],
  education: [
    "best online learning platforms",
    "top e-learning software for schools",
    "recommended online course platforms",
    "best educational technology tools",
    "top learning management systems",
    "best platforms for online certifications",
    "recommended tools for remote learning",
    "top educational apps for students",
    "best online training platforms",
    "recommended e-learning solutions",
    "top virtual classroom software",
    "best educational content platforms",
    "recommended tools for teachers",
    "top student engagement platforms",
    "best online education providers",
  ],
  legal: [
    "best legal practice management software",
    "top case management tools for lawyers",
    "recommended legal research platforms",
    "best document automation for law firms",
    "top legal billing software",
    "best tools for contract management",
    "recommended platforms for legal collaboration",
    "top legal CRM solutions",
    "best e-discovery software",
    "recommended legal analytics tools",
    "top platforms for legal document storage",
    "best law firm management software",
    "recommended tools for legal compliance",
    "top legal workflow automation",
    "best client intake software for lawyers",
  ],
  telecom: [
    "best business phone systems",
    "top VoIP providers for companies",
    "recommended unified communications platforms",
    "best cloud phone solutions",
    "top telecommunications software",
    "best video conferencing tools",
    "recommended business communication systems",
    "top call center software",
    "best enterprise phone solutions",
    "recommended telecom management platforms",
    "top business messaging platforms",
    "best cloud communication services",
    "recommended VoIP solutions for remote teams",
    "top telecommunications for small business",
    "best hosted PBX systems",
  ],
  food: [
    "best restaurant management software",
    "top POS systems for restaurants",
    "recommended food delivery platforms",
    "best inventory management for restaurants",
    "top online ordering systems",
    "best reservation software for restaurants",
    "recommended kitchen management tools",
    "top food service management platforms",
    "best catering management software",
    "recommended menu management systems",
    "top restaurant analytics tools",
    "best food safety management software",
    "recommended restaurant scheduling tools",
    "top food delivery management platforms",
    "best recipe management software",
  ],
  realestate: [
    "best real estate CRM software",
    "top property management platforms",
    "recommended real estate marketing tools",
    "best MLS listing software",
    "top real estate transaction management",
    "best tools for property listings",
    "recommended real estate analytics platforms",
    "top property valuation tools",
    "best real estate lead generation software",
    "recommended platforms for real estate agents",
    "top property management systems",
    "best real estate website builders",
    "recommended virtual tour software",
    "top real estate data platforms",
    "best tenant screening software",
  ],
  consulting: [
    "best consulting project management tools",
    "top client management platforms for consultants",
    "recommended consulting CRM software",
    "best time tracking for consultants",
    "top consulting proposal software",
    "best tools for consulting firms",
    "recommended platforms for consulting projects",
    "top consulting analytics tools",
    "best resource management for consultants",
    "recommended consulting billing software",
    "top platforms for consulting collaboration",
    "best consulting document management",
    "recommended tools for strategic consulting",
    "top consulting workflow automation",
    "best client portal software for consultants",
  ],
  marketing: [
    "best digital marketing platforms",
    "top marketing automation tools",
    "recommended email marketing software",
    "best social media management tools",
    "top SEO platforms for agencies",
    "best content marketing tools",
    "recommended marketing analytics platforms",
    "top advertising management software",
    "best CRM for marketing teams",
    "recommended influencer marketing platforms",
    "top marketing campaign management tools",
    "best lead generation software",
    "recommended marketing collaboration platforms",
    "top brand management tools",
    "best customer engagement platforms",
  ],
  travel: [
    "best travel booking platforms",
    "top travel management software",
    "recommended booking engines for travel agencies",
    "best itinerary planning tools",
    "top travel CRM software",
    "best tools for travel agents",
    "recommended vacation rental software",
    "top travel expense management platforms",
    "best tour operator software",
    "recommended travel analytics tools",
    "top corporate travel management platforms",
    "best flight booking systems",
    "recommended hotel management software",
    "top travel agency software solutions",
    "best destination marketing platforms",
  ],
  manufacturing: [
    "best manufacturing ERP systems",
    "top production planning software",
    "recommended inventory management for manufacturing",
    "best quality management systems",
    "top manufacturing execution systems",
    "best supply chain management platforms",
    "recommended CAD software for manufacturing",
    "top warehouse management systems",
    "best manufacturing analytics tools",
    "recommended production scheduling software",
    "top maintenance management systems",
    "best shop floor management software",
    "recommended manufacturing CRM platforms",
    "top manufacturing automation tools",
    "best product lifecycle management software",
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
    "best platforms for business operations",
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, website, industry }: TestSubmission = await req.json();

    // Validate inputs
    const validatedEmail = validateEmail(email);
    const validatedWebsite = validateWebsite(website);
    const validatedIndustry = validateIndustry(industry);

    console.log("Processing test for industry:", validatedIndustry);

    // Initialize Supabase client with service role for rate limiting
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get client IP for tracking (still record submissions even though rate limiting is disabled)
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

    // RATE LIMITING TEMPORARILY DISABLED FOR TESTING
    // TODO: Re-enable before launch
    /*
    // Check rate limit: 3 tests per email per month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: emailCount, error: emailCountError } = await supabaseAdmin
      .from("test_submissions")
      .select("*", { count: "exact", head: true })
      .eq("email", validatedEmail)
      .gte("created_at", startOfMonth.toISOString());

    if (emailCountError) {
      console.error("Rate limit check error:", emailCountError);
      throw new Error("Unable to process request");
    }

    if (emailCount !== null && emailCount >= 3) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. You can test 3 websites per month. Please try again next month.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check IP-based rate limit: 100 tests per IP per day (testing value - change to 10 for production)
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { count: ipCount, error: ipCountError } = await supabaseAdmin
      .from("test_submissions")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIP)
      .gte("created_at", oneDayAgo.toISOString());

    if (ipCountError) {
      console.error("IP rate limit check error:", ipCountError);
      throw new Error("Unable to process request");
    }

    if (ipCount !== null && ipCount >= 100) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Too many requests from your network. Please try again later.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    */

    // Generate test ID
    const testId = crypto.randomUUID();
    const testDate = new Date().toISOString();

    // Test with OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    console.log(`[${testId}] ===================`);
    console.log(`[${testId}] STEP 1: Fetching website content for AI-readiness audit...`);
    console.log(`[${testId}] ===================`);

    // Fetch the user's website
    let websiteHtml = "";
    let fetchSuccess = false;
    let fetchErrorReason = "";

    try {
      console.log(`[${testId}] Attempting to fetch: ${validatedWebsite}`);
      const websiteResponse = await fetch(validatedWebsite, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FoundIndex-Bot/1.0; +https://foundindex.com)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });

      if (websiteResponse.ok) {
        websiteHtml = await websiteResponse.text();
        fetchSuccess = true;
        console.log(`[${testId}] Website content fetched successfully (${websiteHtml.length} chars)`);
        
        // Check if we got meaningful content
        if (websiteHtml.length < 500) {
          console.warn(`[${testId}] WARNING: Website content is very short (${websiteHtml.length} chars) - may be blocked`);
          fetchErrorReason = `Website returned very little content (${websiteHtml.length} chars)`;
        }
      } else {
        fetchErrorReason = `Website returned HTTP ${websiteResponse.status}: ${websiteResponse.statusText}`;
        console.warn(`[${testId}] ${fetchErrorReason}`);
      }
    } catch (fetchError) {
      fetchErrorReason = fetchError instanceof Error ? fetchError.message : "Unknown fetch error";
      console.error(`[${testId}] Failed to fetch website: ${fetchErrorReason}`);
    }

    // If website fetch completely failed, return an error instead of proceeding
    if (!fetchSuccess || websiteHtml.length < 100) {
      console.error(`[${testId}] CRITICAL: Cannot analyze website - fetch failed or returned no content`);
      return new Response(
        JSON.stringify({
          error: "Unable to access website",
          details: fetchErrorReason || "The website could not be reached or returned no content. Please check the URL and try again.",
          testId,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`[${testId}] ===================`);
    console.log(`[${testId}] STEP 2: AI-Readiness Audit Analysis...`);
    console.log(`[${testId}] ===================`);

    // AI-Readiness Audit with COMPLETE SCORING RUBRIC
    const auditPrompt = `You are an AI visibility expert analyzing websites. Score this homepage using the FoundIndex rubric below.

COMPLETE SCORING RUBRIC:

1. CONTENT CLARITY (0-30 points total)

Value Proposition Clarity (0-10 points):
- 10 pts: First paragraph explicitly states what they do + who it's for + outcome/benefit. No jargon.
- 7-8 pts: Core offering clear within first 2-3 paragraphs. Target mentioned but broad.
- 4-6 pts: Core offering identifiable but requires reading multiple sections. Some jargon.
- 1-3 pts: Core offering buried or heavily obscured by marketing language.
- 0 pts: No clear statement of what the business does.

Target Audience Specification (0-8 points):
- 8 pts: Explicit, narrow target with 3+ characteristics (industry + size + use case).
- 5-7 pts: Target audience with 1-2 characteristics.
- 3-4 pts: Broad definition ("growing businesses").
- 1-2 pts: Implied audience only.
- 0 pts: No indication of who they serve.

Service/Product Specificity (0-8 points):
- 8 pts: Named offerings with clear descriptions and deliverables.
- 5-7 pts: Services/products have names and basic descriptions.
- 3-4 pts: Broad categories without detail.
- 1-2 pts: Vague "solutions" mentioned.
- 0 pts: No description of deliverables.

Concrete Evidence (0-4 points):
- 4 pts: Multiple specific metrics, numbers, or examples.
- 2-3 pts: Some concrete details mixed with generic claims.
- 1 pt: Only abstract benefit claims.
- 0 pts: No concrete evidence.

2. DISCOVERABILITY (0-25 points total)

Information Placement (0-8 points):
- 8 pts: All critical info in first 2 screen sections.
- 5-7 pts: Critical info in first 3-4 sections.
- 3-4 pts: Requires significant scrolling (5+ sections).
- 1-2 pts: Critical info buried deep or scattered.
- 0 pts: Essential info missing from homepage.

Question-Answer Alignment (0-7 points):
- 7 pts: Comprehensive FAQ (10+ questions) or content structured as Q&A.
- 5-6 pts: FAQ with 5-9 questions or content answers common queries.
- 3-4 pts: Limited FAQ (3-4 questions) or partial answers.
- 1-2 pts: No FAQ, content requires inference.
- 0 pts: Cannot answer common questions from homepage.

Content Accessibility (0-6 points):
- 6 pts: All key info in visible HTML text, no interaction required.
- 4-5 pts: Primary info accessible, some in dropdowns/tabs.
- 2-3 pts: Significant info hidden in accordions or behind interactions.
- 0-1 pts: Critical info behind forms, login, or PDFs.

Information Consistency (0-4 points):
- 4 pts: Key details repeated 3+ times, identical terminology.
- 2-3 pts: Some repetition, mostly consistent terminology.
- 1 pt: Information mentioned once only, inconsistent terms.
- 0 pts: Conflicting information.

3. AUTHORITY SIGNALS (0-15 points total)

Evidence-Based Claims (0-6 points):
- 6 pts: 3+ detailed case studies with named clients, metrics, timeframes.
- 4-5 pts: 1-2 case studies or multiple testimonials with attribution.
- 2-3 pts: Client testimonials with names but limited detail.
- 1 pt: Generic testimonials without attribution.
- 0 pts: No case studies or testimonials.

Relevant Credentials (0-4 points):
- 4 pts: Specific, verifiable credentials directly relevant to services.
- 2-3 pts: General industry credentials or memberships.
- 1 pt: Self-reported expertise without validation.
- 0 pts: No credentials mentioned.

Third-Party Validation (0-3 points):
- 3 pts: Coverage in credible publications, recognized awards, verified partnerships.
- 2 pts: Press mentions from less prominent sources.
- 1 pt: Social proof only (reviews, followers).
- 0 pts: No external validation.

Specificity & Verifiability (0-2 points):
- 2 pts: Claims include specific numbers, dates, company names.
- 1 pt: Some specific details, mostly general statements.
- 0 pts: Pure marketing language, no verifiable claims.

4. STRUCTURED DATA (0-15 points total)

Schema.org Implementation (0-7 points):
- 7 pts: Valid JSON-LD for Organization/Service + additional schemas (FAQPage, Product).
- 5-6 pts: Organization Schema with core properties + one additional type.
- 3-4 pts: Basic Organization Schema only with minimal properties.
- 1-2 pts: Schema present but incomplete or with errors.
- 0 pts: No Schema.org markup.

HTML Semantic Structure (0-5 points):
- 5 pts: Proper heading hierarchy, semantic HTML5 elements throughout.
- 3-4 pts: Mostly semantic with some issues.
- 1-2 pts: Minimal semantic structure, heavy div usage.
- 0 pts: Pure div-based layout, no semantic HTML.

Metadata Quality (0-3 points):
- 3 pts: Descriptive title tag, meta description, Open Graph tags, Twitter Cards.
- 2 pts: Basic title and meta description, some Open Graph.
- 1 pt: Minimal metadata, generic descriptions.
- 0 pts: No meta description or generic title only.

5. COMPARISON CONTENT (0-15 points total)

Specific Positioning (0-6 points):
- 6 pts: Explicit target customer with 3+ characteristics and clear use cases.
- 4-5 pts: Target market and specialization clearly stated.
- 2-3 pts: Broad positioning without specificity.
- 0-1 pts: No clear positioning or claims to be best for everyone.

Concrete Differentiators (0-5 points):
- 5 pts: 3+ specific, verifiable differences from alternatives.
- 3-4 pts: 1-2 concrete differentiators plus generic claims.
- 1-2 pts: Primarily generic differentiation claims.
- 0 pts: No differentiation content.

Trade-off Transparency (0-4 points):
- 4 pts: Explicitly acknowledges limitations or who they're NOT for.
- 2-3 pts: Implicit trade-offs through positioning.
- 1 pt: Vague focus areas, no real limitations acknowledged.
- 0 pts: Claims to be best for everyone.

---

WEBSITE URL: ${validatedWebsite}
WEBSITE HTML CONTENT: ${websiteHtml.substring(0, 50000)}

INSTRUCTIONS:
1. Carefully analyze the homepage content against each rubric item above
2. Assign scores based on the criteria (be specific and fair)
3. Calculate total for each category
4. Generate 3 actionable recommendations based on lowest-scoring categories
5. Return ONLY valid JSON in this exact format (no markdown, no code blocks):

{
  "content_clarity_score": 22,
  "structured_data_score": 12,
  "authority_score": 10,
  "discoverability_score": 18,
  "comparison_score": 8,
  "total_score": 70,
  "analysis_details": {
    "content_clarity": "Strong value proposition but target audience could be more specific...",
    "structured_data": "Missing Schema markup...",
    "authority": "Has testimonials but needs case studies with metrics...",
    "discoverability": "Key information is frontloaded but lacks FAQ...",
    "comparison": "Positioning is clear but needs differentiation from competitors..."
  },
  "recommendations": [
    "Add FAQ section with 10+ common client questions",
    "Include specific case studies with client names and measurable outcomes",
    "Add Schema.org Organization markup with JSON-LD"
  ]
}`;

    const auditResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing websites for AI comprehension. You score accurately and consistently using provided rubrics. Return only valid JSON with no markdown.",
          },
          {
            role: "user",
            content: auditPrompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!auditResponse.ok) {
      console.error(`[${testId}] OpenAI audit API error:`, auditResponse.status);
      throw new Error("Failed to perform AI-readiness audit");
    }

    const auditData = await auditResponse.json();

    // === DEBUG: Log FULL OpenAI API Response ===
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] === FULL OPENAI API RESPONSE ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] Full auditData object:`, JSON.stringify(auditData, null, 2));
    console.log(`[${testId}] ═══════════════════════════════════════`);

    let auditText = auditData.choices[0].message.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // === DEBUG: Log Extracted Content ===
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] === EXTRACTED CONTENT FROM OPENAI ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] Raw audit text (full):`, auditText);
    console.log(`[${testId}] Raw audit text length:`, auditText.length);
    console.log(`[${testId}] ═══════════════════════════════════════`);

    const auditResults = JSON.parse(auditText);

    // === DEBUG: Log Parsed JSON ===
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] === PARSED JSON FROM OPENAI ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] Parsed auditResults:`, JSON.stringify(auditResults, null, 2));
    console.log(`[${testId}] Type of auditResults:`, typeof auditResults);
    console.log(`[${testId}] Keys in auditResults:`, Object.keys(auditResults));
    console.log(`[${testId}] ═══════════════════════════════════════`);

    // Normalize scores in case OpenAI returns different shapes
    const getScore = (primary: any, ...fallbacks: any[]): number => {
      const candidates = [primary, ...fallbacks];
      for (const value of candidates) {
        if (typeof value === "number" && !Number.isNaN(value)) return value;
        if (typeof value === "string") {
          const parsed = parseFloat(value);
          if (!Number.isNaN(parsed)) return parsed;
        }
      }
      return 0;
    };

    const breakdown = (auditResults as any).breakdown || (auditResults as any).scores || {};

    const contentClarityScore = getScore(
      (auditResults as any).content_clarity_score,
      (auditResults as any).content_clarity,
      (breakdown as any).content_clarity_score,
      (breakdown as any).content_clarity,
    );

    const structuredDataScore = getScore(
      (auditResults as any).structured_data_score,
      (auditResults as any).structured_data,
      (breakdown as any).structured_data_score,
      (breakdown as any).structured_data,
    );

    const authorityScore = getScore(
      (auditResults as any).authority_score,
      (auditResults as any).authority,
      (breakdown as any).authority_score,
      (breakdown as any).authority,
    );

    const discoverabilityScore = getScore(
      (auditResults as any).discoverability_score,
      (auditResults as any).discoverability,
      (breakdown as any).discoverability_score,
      (breakdown as any).discoverability,
    );

    const comparisonScore = getScore(
      (auditResults as any).comparison_score,
      (auditResults as any).comparison,
      (breakdown as any).comparison_score,
      (breakdown as any).comparison,
    );

    const totalScore = getScore(
      (auditResults as any).total_score,
      (auditResults as any).score,
      (breakdown as any).total_score,
      (breakdown as any).score,
    );

    // === DEBUG: Log Individual Score Extraction ===
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] === INDIVIDUAL SCORE EXTRACTION ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] contentClarityScore extracted:`, contentClarityScore);
    console.log(
      `[${testId}]   - Tried: (auditResults as any).content_clarity_score =`,
      (auditResults as any).content_clarity_score,
    );
    console.log(
      `[${testId}]   - Tried: (auditResults as any).content_clarity =`,
      (auditResults as any).content_clarity,
    );
    console.log(`[${testId}]   - Tried: breakdown.content_clarity_score =`, (breakdown as any).content_clarity_score);
    console.log(`[${testId}] structuredDataScore extracted:`, structuredDataScore);
    console.log(
      `[${testId}]   - Tried: (auditResults as any).structured_data_score =`,
      (auditResults as any).structured_data_score,
    );
    console.log(
      `[${testId}]   - Tried: (auditResults as any).structured_data =`,
      (auditResults as any).structured_data,
    );
    console.log(`[${testId}]   - Tried: breakdown.structured_data_score =`, (breakdown as any).structured_data_score);
    console.log(`[${testId}] authorityScore extracted:`, authorityScore);
    console.log(
      `[${testId}]   - Tried: (auditResults as any).authority_score =`,
      (auditResults as any).authority_score,
    );
    console.log(`[${testId}]   - Tried: (auditResults as any).authority =`, (auditResults as any).authority);
    console.log(`[${testId}]   - Tried: breakdown.authority_score =`, (breakdown as any).authority_score);
    console.log(`[${testId}] discoverabilityScore extracted:`, discoverabilityScore);
    console.log(
      `[${testId}]   - Tried: (auditResults as any).discoverability_score =`,
      (auditResults as any).discoverability_score,
    );
    console.log(
      `[${testId}]   - Tried: (auditResults as any).discoverability =`,
      (auditResults as any).discoverability,
    );
    console.log(`[${testId}]   - Tried: breakdown.discoverability_score =`, (breakdown as any).discoverability_score);
    console.log(`[${testId}] comparisonScore extracted:`, comparisonScore);
    console.log(
      `[${testId}]   - Tried: (auditResults as any).comparison_score =`,
      (auditResults as any).comparison_score,
    );
    console.log(`[${testId}]   - Tried: (auditResults as any).comparison =`, (auditResults as any).comparison);
    console.log(`[${testId}]   - Tried: breakdown.comparison_score =`, (breakdown as any).comparison_score);
    console.log(`[${testId}] totalScore extracted:`, totalScore);
    console.log(`[${testId}]   - Tried: (auditResults as any).total_score =`, (auditResults as any).total_score);
    console.log(`[${testId}]   - Tried: (auditResults as any).score =`, (auditResults as any).score);
    console.log(`[${testId}]   - Tried: breakdown.total_score =`, (breakdown as any).total_score);
    console.log(`[${testId}] ═══════════════════════════════════════`);

    // === ENHANCED LOGGING: What OpenAI returned ===
    console.log(`[${testId}] 
═══════════════════════════════════════`);
    console.log(`[${testId}] === AUDIT RESULTS FROM OPENAI ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] Raw audit JSON:`, JSON.stringify(auditResults, null, 2));
    console.log(`[${testId}] Keys in auditResults:`, Object.keys(auditResults));
    console.log(`[${testId}] Total score (normalized): ${totalScore}/100`);
    console.log(`[${testId}] Content clarity (normalized): ${contentClarityScore}/25`);
    console.log(`[${testId}] Structured data (normalized): ${structuredDataScore}/20`);
    console.log(`[${testId}] Authority (normalized): ${authorityScore}/20`);
    console.log(`[${testId}] Discoverability (normalized): ${discoverabilityScore}/20`);
    console.log(`[${testId}] Comparison (normalized): ${comparisonScore}/15`);
    console.log(
      `[${testId}] Recommendations count: ${Array.isArray((auditResults as any).recommendations) ? (auditResults as any).recommendations.length : 0}`,
    );
    console.log(`[${testId}] ═══════════════════════════════════════`);

    console.log(`[${testId}] AI-Readiness Audit Complete:`);
    console.log(`[${testId}] - Content Clarity: ${contentClarityScore}/25`);
    console.log(`[${testId}] - Structured Data: ${structuredDataScore}/20`);
    console.log(`[${testId}] - Authority Signals: ${authorityScore}/20`);
    console.log(`[${testId}] - Discoverability: ${discoverabilityScore}/20`);
    console.log(`[${testId}] - Comparison Content: ${comparisonScore}/15`);
    console.log(`[${testId}] - TOTAL AI-READINESS SCORE: ${totalScore}/100`);
    console.log(`[${testId}] - Recommendations: ${Array.isArray((auditResults as any).recommendations) ? (auditResults as any).recommendations.length : 0} improvements suggested`);

    // CRITICAL: Validate that we got real scores, not zeros
    const allScoresZero = totalScore === 0 && contentClarityScore === 0 && structuredDataScore === 0 && 
                          authorityScore === 0 && discoverabilityScore === 0 && comparisonScore === 0;
    
    if (allScoresZero) {
      console.error(`[${testId}] CRITICAL ERROR: All scores are 0 - OpenAI analysis likely failed`);
      console.error(`[${testId}] Raw auditResults:`, JSON.stringify(auditResults, null, 2));
      return new Response(
        JSON.stringify({
          error: "Analysis failed",
          details: "Unable to score the website. This may be due to the website structure or content. Please try again or contact support.",
          testId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Warn if score seems suspiciously low for a real website
    if (totalScore < 20 && websiteHtml.length > 1000) {
      console.warn(`[${testId}] WARNING: Score (${totalScore}) seems unusually low for a website with ${websiteHtml.length} chars of content`);
    }

    console.log(`[${testId}] ===================`);
    console.log(`[${testId}] STEP 3: Analyzing business type for query generation...`);
    console.log(`[${testId}] ===================`);

    // Step 3: Analyze website and generate custom queries
    let businessType = validatedIndustry;
    let queries: string[] = [];

    try {
      const analysisPrompt = `Analyze this business website: ${validatedWebsite}

Based on the URL and industry hint (${validatedIndustry}), determine:

1. What type of business is this? (be specific: "travel blog", "fashion marketplace", "SaaS project tool", etc.)
2. What would potential customers/users search for when looking for this type of business/service?

Generate 15 specific buyer-intent queries that someone would ask ChatGPT when looking for this type of business.

RULES:
- Queries should be natural questions buyers actually ask
- Focus on problems this business solves
- Include comparison queries (e.g. "X vs Y")
- Include recommendation queries (e.g. "best X for Y")
- Make them specific to the business type

Return ONLY valid JSON:
{
  "business_type": "specific category",
  "queries": [
    "query 1 here",
    "query 2 here"
  ]
}`;

      const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert at analyzing businesses and buyer search behavior. Return ONLY valid JSON with no markdown formatting.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error(`OpenAI analysis failed: ${analysisResponse.status}`);
      }

      const analysisData = await analysisResponse.json();
      let analysisText = analysisData.choices[0].message.content;

      // Clean any markdown formatting (```json or ``` wrappers)
      analysisText = analysisText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      console.log(`[${testId}] Raw analysis response:`, analysisText.substring(0, 200));

      // Parse JSON response
      try {
        const parsed = JSON.parse(analysisText);
        businessType = parsed.business_type || validatedIndustry;
        queries = parsed.queries || [];
      } catch (parseError) {
        console.error(`[${testId}] JSON parse error:`, parseError);
        // Try to extract JSON with regex as fallback
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          businessType = parsed.business_type || validatedIndustry;
          queries = parsed.queries || [];
        }
      }

      console.log(`[${testId}] Business type identified:`, businessType);
      console.log(`[${testId}] Generated ${queries.length} custom queries`);

      // Fallback to industry queries if generation failed
      if (!queries || queries.length < 10) {
        console.log(`[${testId}] Custom query generation insufficient, falling back to industry queries`);
        queries = industryQueries[validatedIndustry] || industryQueries.other;
        businessType = validatedIndustry;
      }
    } catch (error) {
      console.error(`[${testId}] Error generating custom queries:`, error);
      console.log(`[${testId}] Falling back to industry queries`);
      queries = industryQueries[validatedIndustry] || industryQueries.other;
    }

    let totalRecommendations = 0;
    const queryResults = [];

    console.log(`[${testId}] Step 2: Testing ${queries.length} queries with ChatGPT...`);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`[${testId}] Processing query ${i + 1}/${queries.length}...`);

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that recommends software and services. Provide specific recommendations with brief explanations.",
              },
              {
                role: "user",
                content: query,
              },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Check if website is mentioned (improved domain + brand matching)
        let domain = validatedWebsite;
        try {
          const url = new URL(validatedWebsite);
          domain = url.hostname.replace(/^www\./, "");
        } catch (e) {
          domain = validatedWebsite.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
        }

        const brandName = domain.split(".")[0];
        const responseText = aiResponse.toLowerCase();

        // Check multiple variations for better matching
        const domainFound = responseText.includes(domain.toLowerCase());
        const brandFound = responseText.includes(brandName.toLowerCase());

        // Also check brand with spaces (e.g., "lighttravelaction" -> "light travel action")
        const brandWithSpaces = brandName.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
        const brandSpacedFound = responseText.includes(brandWithSpaces);

        const wasRecommended = domainFound || brandFound || brandSpacedFound;

        console.log("[DOMAIN] Testing for domain:", domain);
        console.log("[MATCH] Domain:", domain, "| Brand:", brandName, "| Brand with spaces:", brandWithSpaces);
        console.log(
          "[MATCH] Domain found?",
          domainFound,
          "| Brand found?",
          brandFound,
          "| Brand spaced found?",
          brandSpacedFound,
        );
        console.log("[MATCH] Final result:", wasRecommended);

        if (wasRecommended) {
          totalRecommendations++;
          console.log("[COUNTER] Recommendation found! Total now:", totalRecommendations);
        }

        console.log(`[Query ${i + 1}] Testing:`, query);
        console.log(`[Query ${i + 1}] AI Response:`, aiResponse.substring(0, 200));
        console.log(`[Query ${i + 1}] Looking for domain:`, domain);
        console.log(`[Query ${i + 1}] Was recommended:`, wasRecommended);
        console.log(`[Query ${i + 1}] Total recommendations so far:`, totalRecommendations);

        // Improve context snippet - extract relevant sentence or take more characters
        let contextSnippet = aiResponse.substring(0, 400);
        if (wasRecommended) {
          const sentences = aiResponse.split(/[.!?]\s+/);
          const relevantSentence = sentences.find(
            (s: string) =>
              s.toLowerCase().includes(brandName.toLowerCase()) || s.toLowerCase().includes(domain.toLowerCase()),
          );
          if (relevantSentence && relevantSentence.length < 400) {
            contextSnippet = relevantSentence;
          }
        }

        queryResults.push({
          query_number: i + 1,
          query_text: query,
          engine: "ChatGPT",
          was_recommended: wasRecommended,
          context_snippet: contextSnippet,
          recommendation_position: wasRecommended ? 1 : null,
          quality_rating: wasRecommended ? "high" : "none",
        });

        console.log(`[${testId}] Completed query ${i + 1}/${queries.length} - Recommended: ${wasRecommended}`);
        if ((i + 1) % 5 === 0 || i + 1 === queries.length) {
          console.log(`[${testId}] Progress: ${i + 1}/${queries.length} queries complete`);
        }
      } catch (error) {
        console.error(`[${testId}] Error processing query ${i + 1}:`, error);
        queryResults.push({
          query_number: i + 1,
          query_text: query,
          engine: "ChatGPT",
          was_recommended: false,
          context_snippet: "Error occurred during testing",
          recommendation_position: null,
          quality_rating: "none",
        });
      }
    }

    console.log(`[${testId}] All queries completed. Total recommendations: ${totalRecommendations}/${queries.length}`);

    console.log("[LOOP] All queries complete");
    console.log("[SCORE] Final totalRecommendations:", totalRecommendations);
    console.log("[SCORE] Total queries:", queries.length);

    const recommendationRate = (totalRecommendations / queries.length) * 100;
    const foundIndexScore = Math.round(recommendationRate);

    console.log("[SCORE] Recommendation rate:", recommendationRate);
    console.log("[SCORE] Calculated score:", foundIndexScore);

    console.log("[FINAL] Total recommendations:", totalRecommendations);
    console.log("[FINAL] Total queries:", queries.length);
    console.log("[FINAL] Recommendation rate:", recommendationRate);
    console.log("[FINAL] FoundIndex score:", foundIndexScore);

    console.log(`[${testId}] Test complete: ${totalRecommendations}/${queries.length} recommendations`);

    // Record submission in database for rate limiting
    const { error: insertError } = await supabaseAdmin.from("test_submissions").insert({
      email: validatedEmail,
      ip_address: clientIP,
      test_id: testId,
      created_at: testDate,
    });

    if (insertError) {
      console.error(`[${testId}] Failed to record submission:`, insertError);
    }

    // Store in Airtable
    console.log(`[${testId}] Writing results to Airtable...`);
    const airtableApiKey = Deno.env.get("AIRTABLE_API_KEY");
    const airtableBaseId = Deno.env.get("AIRTABLE_BASE_ID");

    console.log(
      `[${testId}] Airtable config - Base ID exists: ${!!airtableBaseId}, API Key exists: ${!!airtableApiKey}`,
    );

    // Store test record - Airtable field mapping
    const airtableFieldMapping: Record<string, string> = {
      testId: "test_id",
      email: "user_email",
      website: "website_url",
      industry: "industry",
      testDate: "test_date",
      foundIndexTotalScore: "foundindex_score",
      contentClarity: "content_clarity_score",
      structuredData: "structured_data_score",
      authority: "authority_score",
      discoverability: "discoverability_score",
      comparison: "comparison_score",
      analysisDetails: "analysis_details",
      recommendations: "recommendations",
      businessType: "business_type",
      queries: "generated_queries",
      chatGptScore: "chatgpt_score",
      claudeScore: "claude_score",
      perplexityScore: "perplexity_score",
      recommendationsCount: "recommendations_count",
      recommendationRate: "recommendation_rate",
    };

    const internalPayload = {
      testId,
      email: validatedEmail,
      website: validatedWebsite,
      industry: validatedIndustry, // Maps to single-select: "saas", "financial", "ecommerce", "professional", "healthcare", "other"
      testDate,

      // AI Readiness Scores (PRIMARY) - Use audit-based score as main score
      foundIndexTotalScore: totalScore, // This is the AI-readiness audit score (0-100)
      contentClarity: contentClarityScore,
      structuredData: structuredDataScore,
      authority: authorityScore,
      discoverability: discoverabilityScore,
      comparison: comparisonScore,
      analysisDetails: (auditResults as any).analysis_details,
      recommendations: (auditResults as any).recommendations,

      // Query-Based Visibility (SECONDARY)
      businessType, // AI-identified business type
      queries, // Store custom queries as formatted JSON
      chatGptScore: foundIndexScore,
      claudeScore: 0, // Not yet implemented
      perplexityScore: 0, // Not yet implemented
      recommendationsCount: totalRecommendations,
      recommendationRate: parseFloat(recommendationRate.toFixed(3)), // 3 decimal places per Airtable schema
    };

    const testRecordFields: Record<string, any> = {};

    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] === AIRTABLE FIELD NAME MAPPING ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);

    Object.entries(internalPayload).forEach(([internalKey, value]) => {
      const airtableField = airtableFieldMapping[internalKey];
      if (!airtableField) {
        console.warn(`[${testId}] WARNING: No Airtable mapping for internal field "${internalKey}"`);
        return;
      }

      // Transform complex objects to JSON strings where needed
      let finalValue = value;
      if (internalKey === "analysisDetails" || internalKey === "recommendations" || internalKey === "queries") {
        try {
          finalValue = JSON.stringify(value, null, 2);
        } catch (err) {
          console.error(`[${testId}] Failed to stringify field "${internalKey}" for Airtable:`, err);
          finalValue = null;
        }
      }

      testRecordFields[airtableField] = finalValue;
      console.log(`[${testId}]   ${internalKey} -> ${airtableField}`);
    });

    console.log(`[${testId}] ═══════════════════════════════════════`);

    // === DEBUG: Log Final Scores Object Before Airtable Write ===
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] === FINAL SCORES OBJECT BEFORE AIRTABLE WRITE ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] Final scores being written to Airtable:`);
    console.log(`[${testId}]   foundindex_score (totalScore):`, totalScore);
    console.log(`[${testId}]   content_clarity_score:`, contentClarityScore);
    console.log(`[${testId}]   structured_data_score:`, structuredDataScore);
    console.log(`[${testId}]   authority_score:`, authorityScore);
    console.log(`[${testId}]   discoverability_score:`, discoverabilityScore);
    console.log(`[${testId}]   comparison_score:`, comparisonScore);
    console.log(`[${testId}]   chatgpt_score (foundIndexScore):`, foundIndexScore);
    console.log(`[${testId}]   recommendations_count:`, totalRecommendations);
    console.log(`[${testId}]   recommendation_rate:`, parseFloat(recommendationRate.toFixed(3)));
    console.log(`[${testId}] ═══════════════════════════════════════`);

    // === ENHANCED LOGGING: What we're writing to Airtable ===
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] === PREPARING AIRTABLE WRITE ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);

    // Log EVERY field individually
    console.log(`[${testId}] FIELD-BY-FIELD BREAKDOWN:`);
    Object.entries(testRecordFields).forEach(([key, value]) => {
      console.log(
        `[${testId}]   - ${key}: ${typeof value === "string" && value.length > 100 ? value.substring(0, 100) + "..." : JSON.stringify(value)} (type: ${typeof value})`,
      );
    });

    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] COMPLETE AIRTABLE REQUEST BODY (before validation):`);
    let requestBody = {
      fields: testRecordFields,
    };
    console.log(`[${testId}]`, JSON.stringify(requestBody, null, 2));
    console.log(`[${testId}] ═══════════════════════════════════════`);

    // ============ DEFENSIVE FIELD VALIDATION ============
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] === VALIDATING FIELDS AGAINST AIRTABLE SCHEMA ===`);
    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] Airtable Base ID: ${airtableBaseId}`);
    console.log(`[${testId}] Table Name: Tests`);

    // Start with all fields we want to send
    let validatedFields = { ...testRecordFields };

    // Fetch the actual table schema from Airtable
    try {
      console.log(`[${testId}] Fetching table schema from Airtable...`);
      const schemaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${airtableBaseId}/tables`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${airtableApiKey}`,
        },
      });

      if (schemaResponse.ok) {
        const schemaData = await schemaResponse.json();
        const testsTable = schemaData.tables?.find((t: any) => t.name === "Tests");

        if (testsTable) {
          console.log(`[${testId}] ✅ Found 'Tests' table in Airtable base`);

          // Get list of all available field names
          const availableFieldNames = testsTable.fields?.map((f: any) => f.name) || [];
          console.log(`[${testId}] Fields that actually exist in Airtable:`, availableFieldNames.join(", "));

          // Get list of fields we're trying to send
          const ourFieldNames = Object.keys(testRecordFields);
          console.log(`[${testId}] Fields we're trying to send:`, ourFieldNames.join(", "));

          // Find fields that exist and fields that don't
          const validFields = ourFieldNames.filter((f) => availableFieldNames.includes(f));
          const invalidFields = ourFieldNames.filter((f) => !availableFieldNames.includes(f));

          console.log(`[${testId}] ═══════════════════════════════════════`);
          console.log(`[${testId}] FIELD VALIDATION RESULTS:`);
          console.log(`[${testId}]   ✅ Valid fields (${validFields.length}):`, validFields.join(", "));

          if (invalidFields.length > 0) {
            console.warn(
              `[${testId}]   ⚠️ Skipping invalid fields (${invalidFields.length}):`,
              invalidFields.join(", "),
            );

            // Remove invalid fields from our payload
            invalidFields.forEach((fieldName) => {
              delete validatedFields[fieldName];
            });

            console.log(`[${testId}]   🔧 These fields should be added to your Airtable 'Tests' table:`);
            invalidFields.forEach((f) => {
              console.log(`[${testId}]      - ${f}`);
            });
          } else {
            console.log(`[${testId}]   ✅ All fields are valid!`);
          }
        } else {
          console.error(`[${testId}] ❌ 'Tests' table NOT FOUND in Airtable base`);
          console.error(`[${testId}] Available tables:`, schemaData.tables?.map((t: any) => t.name).join(", "));
          console.warn(`[${testId}] ⚠️ Proceeding with all fields (unvalidated)`);
        }
      } else {
        console.error(`[${testId}] Failed to fetch Airtable schema: ${schemaResponse.status}`);
        const errorText = await schemaResponse.text();
        console.error(`[${testId}] Schema fetch error:`, errorText);
        console.warn(`[${testId}] ⚠️ Proceeding with all fields (unvalidated)`);
      }
    } catch (schemaError) {
      console.error(`[${testId}] Exception fetching Airtable schema:`, schemaError);
      console.warn(`[${testId}] ⚠️ Proceeding with all fields (unvalidated)`);
    }

    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] FINAL VALIDATED FIELDS TO SEND (${Object.keys(validatedFields).length} fields):`);
    Object.keys(validatedFields).forEach((key) => {
      console.log(`[${testId}]   ✓ ${key}`);
    });
    console.log(`[${testId}] ═══════════════════════════════════════`);
    // ============ END VALIDATION ============

    // Update request body with validated fields only
    requestBody.fields = validatedFields;

    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] FINAL REQUEST BODY TO SEND TO AIRTABLE:`);
    console.log(`[${testId}]`, JSON.stringify(requestBody, null, 2));
    console.log(`[${testId}] ═══════════════════════════════════════`);

    let testRecordResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Tests`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${airtableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[${testId}] ═══════════════════════════════════════`);
    console.log(`[${testId}] AIRTABLE RESPONSE RECEIVED`);
    console.log(`[${testId}] Status Code: ${testRecordResponse.status}`);
    console.log(`[${testId}] Status Text: ${testRecordResponse.statusText}`);

    if (!testRecordResponse.ok) {
      const errorText = await testRecordResponse.text();
      console.error(`[${testId}] ❌ AIRTABLE WRITE FAILED ❌`);
      console.error(`[${testId}] Response Status: ${testRecordResponse.status}`);
      console.error(`[${testId}] Response Body:`, errorText);
      console.error(
        `[${testId}] Full Error Details:`,
        JSON.stringify(
          {
            status: testRecordResponse.status,
            statusText: testRecordResponse.statusText,
            headers: Object.fromEntries(testRecordResponse.headers.entries()),
            body: errorText,
          },
          null,
          2,
        ),
      );

      // Handle UNKNOWN_FIELD_NAME by removing ONLY the problematic field
      let retried = false;
      try {
        const errorJson = JSON.parse(errorText);
        const isUnknownField = testRecordResponse.status === 422 && errorJson?.error?.type === "UNKNOWN_FIELD_NAME";

        if (isUnknownField) {
          retried = true;

          // Extract the specific field name from the error message
          // Error format: "Unknown field name: \"field_name\""
          const errorMessage = errorJson?.error?.message || "";
          const fieldNameMatch = errorMessage.match(/Unknown field name: "([^"]+)"/);
          const problematicField = fieldNameMatch ? fieldNameMatch[1] : null;

          console.error(`[${testId}] ═══════════════════════════════════════`);
          console.error(`[${testId}] ❌ AIRTABLE FIELD ERROR DETECTED`);
          console.error(`[${testId}] Full Airtable Error:`, JSON.stringify(errorJson, null, 2));

          let fallbackFields = { ...testRecordFields };

          if (problematicField) {
            console.error(`[${testId}] ❌ Problematic Field: "${problematicField}"`);
            console.error(`[${testId}] This field needs to be added to your Airtable 'Tests' table`);
            console.warn(`[${testId}] Retrying without the "${problematicField}" field...`);

            // Remove ONLY the problematic field
            delete fallbackFields[problematicField];

            console.log(`[${testId}] Field "${problematicField}" removed from payload`);
            console.log(`[${testId}] Remaining fields:`, Object.keys(fallbackFields).join(", "));
          } else {
            // Fallback: if we can't identify the specific field, remove all optional fields
            console.error(`[${testId}] ⚠️ Could not identify specific problematic field from error message`);
            console.error(`[${testId}] Error message was: "${errorMessage}"`);
            console.warn(`[${testId}] Removing all optional fields as fallback...`);

            delete fallbackFields.content_clarity_score;
            delete fallbackFields.structured_data_score;
            delete fallbackFields.authority_score;
            delete fallbackFields.discoverability_score;
            delete fallbackFields.comparison_score;
            delete fallbackFields.analysis_details;
            delete fallbackFields.recommendations;
            delete fallbackFields.business_type;
            delete fallbackFields.generated_queries;
          }

          console.log(`[${testId}] RETRY REQUEST BODY:`, JSON.stringify({ fields: fallbackFields }, null, 2));
          console.log(`[${testId}] ═══════════════════════════════════════`);

          testRecordResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Tests`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${airtableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: fallbackFields,
            }),
          });

          console.log(`[${testId}] RETRY RESPONSE - Status: ${testRecordResponse.status}`);
          const retryResponseText = await testRecordResponse.clone().text();
          console.log(`[${testId}] RETRY RESPONSE - Body:`, retryResponseText);
        }
      } catch (parseError) {
        console.error(`[${testId}] Failed to parse Airtable error JSON:`, parseError);
      }

      if (!testRecordResponse.ok) {
        const finalErrorText = retried ? await testRecordResponse.text() : errorText;
        console.error(
          `[${testId}] Airtable Tests write FINAL failure - Status: ${testRecordResponse.status}, Response:`,
          finalErrorText,
        );
        throw new Error(`Airtable Tests write failed: ${finalErrorText}`);
      }
    }

    const testRecordData = await testRecordResponse.json();
    const airtableRecordId = testRecordData.id;
    console.log(`[${testId}] ✅ AIRTABLE WRITE SUCCESS ✅`);
    console.log(`[${testId}] Record ID: ${airtableRecordId}`);
    console.log(`[${testId}] Full Success Response:`, JSON.stringify(testRecordData, null, 2));
    console.log(`[${testId}] ═══════════════════════════════════════`);

    // Store query results in batches
    const batchSize = 10;
    console.log(`[${testId}] Writing ${queryResults.length} query results in batches of ${batchSize}...`);

    for (let i = 0; i < queryResults.length; i += batchSize) {
      const batch = queryResults.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(queryResults.length / batchSize);
      console.log(
        `[Airtable] Writing Query_Results batch: ${batchNumber} of ${totalBatches} (${batch.length} records)`,
      );
      console.log(
        `[Airtable] Batch ${batchNumber} sample record:`,
        JSON.stringify(
          {
            test_id: testId,
            query_number: batch[0].query_number,
            query_text: batch[0].query_text.substring(0, 50) + "...",
            engine: batch[0].engine,
            was_recommended: batch[0].was_recommended,
            quality_rating: batch[0].quality_rating,
          },
          null,
          2,
        ),
      );

      const batchResponse = await fetch(`https://api.airtable.com/v0/${airtableBaseId}/Query_Results`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${airtableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: batch.map((result) => ({
            fields: {
              test_id: testId,
              ...result,
            },
          })),
        }),
      });

      console.log(`[${testId}] Batch ${batchNumber} - Status: ${batchResponse.status}`);

      if (!batchResponse.ok) {
        const errorText = await batchResponse.text();
        console.error(
          `[${testId}] Airtable Query_Results batch ${batchNumber} write FAILED - Status: ${batchResponse.status}, Response:`,
          errorText,
        );
        throw new Error(`Airtable Query_Results write failed: ${errorText}`);
      }

      const batchData = await batchResponse.json();
      console.log(
        `[Airtable] Query_Results batch ${batchNumber} of ${totalBatches} successful - Wrote ${batchData.records?.length || 0} records`,
      );
    }

    console.log(`[${testId}] All ${queryResults.length} query results stored successfully in Airtable`);

    // Send email notification using service role key
    console.log(`[${testId}] Sending email notification to ${validatedEmail}...`);
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: validatedEmail,
          testId: testId,
          score: foundIndexScore,
          website: validatedWebsite,
        }),
      });

      console.log(`[${testId}] Email sent successfully`);
    } catch (emailError) {
      console.error(`[${testId}] Email send failed:`, emailError);
    }

    console.log(`[${testId}] SUCCESS! Test ID: ${testId}, AI-Readiness Score: ${totalScore}, ChatGPT Score: ${foundIndexScore}`);

    return new Response(
      JSON.stringify({
        success: true,
        testId,
        score: totalScore, // Primary AI-readiness audit score (used by frontend)
        foundIndexScore,   // Secondary ChatGPT recommendation score
        totalRecommendations,
        totalQueries: queries.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Request processing error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      type: typeof error,
      raw: error,
    });

    // Return specific validation errors
    if (
      error instanceof Error &&
      (error.message.includes("Email") ||
        error.message.includes("Website") ||
        error.message.includes("Industry") ||
        error.message.includes("Rate limit"))
    ) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Return more detailed error for debugging
    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
