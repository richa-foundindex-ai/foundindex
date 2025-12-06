import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Methodology - FoundIndex</title>
        <meta name="description" content="Learn how FoundIndex scores websites across 47 criteria for AI visibility. Understand our analysis methodology." />
      </Helmet>
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
          ← Back to home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Methodology</h1>
          <h2 className="text-xl text-muted-foreground">How we calculate your FI score™</h2>
        </div>

        <p className="text-lg text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
          FoundIndex evaluates 47+ criteria by analyzing specific signals that determine whether AI search engines can
          find, understand, and cite your content.
        </p>

        {/* Our Approach */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-blue-200">
          <CardHeader>
            <CardTitle>Our Approach</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-4">
              We show you WHERE to add expertise signals. What you put there is your competitive advantage.
            </p>
            <p className="text-muted-foreground">
              AI finds the gaps. You fill them with what only humans can create.
            </p>
          </CardContent>
        </Card>

        {/* What We Analyze vs What You Create */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What We Analyze vs What You Create</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">What FoundIndex Detects</th>
                    <th className="text-left py-3 px-4 font-semibold">What Only You Can Add</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Missing author schema</td>
                    <td className="py-3 px-4 font-medium text-primary">Your actual credentials</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">No testimonial markup</td>
                    <td className="py-3 px-4 font-medium text-primary">Real customer stories</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Generic FAQ structure</td>
                    <td className="py-3 px-4 font-medium text-primary">Your unique insights</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Missing expertise signals</td>
                    <td className="py-3 px-4 font-medium text-primary">Original research & data</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Weak content structure</td>
                    <td className="py-3 px-4 font-medium text-primary">Firsthand experience</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Research foundation */}
        <Card className="mb-8 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle>Research foundation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Our methodology is based on:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Microsoft's AI search optimization guidelines (2025)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Analysis of 1,000+ AI citation patterns across ChatGPT, Perplexity, and Claude</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Schema.org structured data specifications</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span>Real-world testing and validation with beta users</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Scoring categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scoring categories (100 points total)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Deterministic */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Technical analysis (40 points)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Parsed directly from your HTML — consistent and reproducible.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Schema markup (JSON-LD validation)</span>
                  <span className="font-medium">20 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Semantic HTML structure</span>
                  <span className="font-medium">12 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Technical foundation (meta, canonical, etc.)</span>
                  <span className="font-medium">8 pts</span>
                </li>
              </ul>
            </div>

            <hr />

            {/* AI-assessed */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Content analysis (60 points)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Assessed by AI to evaluate readability and authority signals.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Content clarity (value proposition)</span>
                  <span className="font-medium">25 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Answer structure (front-loaded answers)</span>
                  <span className="font-medium">20 pts</span>
                </li>
                <li className="flex justify-between">
                  <span>Authority signals (credentials, citations)</span>
                  <span className="font-medium">15 pts</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Industry average */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Industry average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The industry average shown in your results is calculated from all tests run in the past 30 days. This
              gives you a real benchmark against other websites being analyzed, not a static number.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Currently based on {">"}50 real website analyses. Updated daily.
            </p>
          </CardContent>
        </Card>

        {/* Schema types */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Schema types we validate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <span className="px-3 py-1 bg-muted rounded">Organization</span>
              <span className="px-3 py-1 bg-muted rounded">Article</span>
              <span className="px-3 py-1 bg-muted rounded">BlogPosting</span>
              <span className="px-3 py-1 bg-muted rounded">FAQPage</span>
              <span className="px-3 py-1 bg-muted rounded">BreadcrumbList</span>
              <span className="px-3 py-1 bg-muted rounded">WebSite</span>
              <span className="px-3 py-1 bg-muted rounded">WebPage</span>
              <span className="px-3 py-1 bg-muted rounded">Product</span>
              <span className="px-3 py-1 bg-muted rounded">LocalBusiness</span>
              <span className="px-3 py-1 bg-muted rounded">Service</span>
              <span className="px-3 py-1 bg-muted rounded">Person</span>
              <span className="px-3 py-1 bg-muted rounded">ContactPoint</span>
            </div>
          </CardContent>
        </Card>

        {/* Technical Deep Dive */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Technical Deep Dive</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="q1">
                <AccordionTrigger className="text-left">
                  Which AI platforms do you test against?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>
                    We do <strong>NOT</strong> query live ChatGPT/Claude/Perplexity about your brand (that would be rate-limited and unethical).
                  </p>
                  <p>Instead we replicate the parsing pattern modern AI systems use for retrieval:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Headless browser → HTML extraction</li>
                    <li>Schema.org validation (deterministic)</li>
                    <li>GPT-4o-mini content understanding</li>
                  </ul>
                  <p>This mirrors how AI systems process web content internally.</p>
                  <p className="text-sm italic">
                    Our validation: Sites scoring 70+ had significantly higher success rates for AI information extraction in our 143-site analysis.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q2">
                <AccordionTrigger className="text-left">
                  What's the difference from Semrush AI Visibility?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>Semrush</strong> tracks brand mentions AFTER AI knows you (requires established brand).
                  </p>
                  <p>
                    <strong>FoundIndex</strong> optimizes page structure BEFORE/DURING discovery (works for any URL).
                  </p>
                  <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                    <p>Example: When we tested foundindex.com on Semrush → "No data found"</p>
                    <p>When we tested semrush.com on FoundIndex → 59/100 (missing FAQ schema)</p>
                  </div>
                  <p className="font-medium">You need both: FoundIndex to fix structure, Semrush to track growth.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q3">
                <AccordionTrigger className="text-left">
                  Why GPT-4o-mini vs open-source models?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>
                    Cost at current scale: GPT-4o-mini ~$2-5/month vs self-hosted Llama 70B $500-1000/month GPU hosting.
                  </p>
                  <p>Break-even: ~50K tests/month. Using GPT until scale justifies complexity.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q4">
                <AccordionTrigger className="text-left">
                  How accurate is the scoring?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>
                    Based on 143+ site analysis, we observe strong correlation between scores and AI parsing success. Sites with comprehensive schema markup and clear content structure consistently enable better information extraction.
                  </p>
                  <p>We're continuously validating and will publish detailed benchmarks as our dataset grows.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q5">
                <AccordionTrigger className="text-left">
                  What about JavaScript-rendered content?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Currently parsing static HTML + JSON-LD. Dynamic rendering via headless browser: roadmap for Q1 2026.</p>
                  <p className="text-sm italic">
                    Best practice: 80% of schema should be in static markup anyway. For SPAs, use server-side rendering for critical schema.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q6">
                <AccordionTrigger className="text-left">
                  Why focus on schema instead of training your own model?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Two reasons:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <strong>Technical</strong> — schema.org is the Web's semantic layer used by Google/OpenAI/Microsoft. We validate against the standard, not one vendor's implementation.
                    </li>
                    <li>
                      <strong>Business</strong> — Structural validation costs $5/month. Training custom models costs $10K+ with no accuracy guarantee. We build what's useful now.
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q7">
                <AccordionTrigger className="text-left">
                  Do you store my content?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p><strong>We store:</strong> URL, timestamp, scores, schema types found, recommendations.</p>
                  <p><strong>We delete:</strong> Full HTML (after analysis), rendered content, user IP.</p>
                  <p>GDPR/CCPA compliant. Business model: subscriptions, not data monetization.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q8">
                <AccordionTrigger className="text-left">
                  Does this work for non-English sites?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Schema validation works universally (language-agnostic).</p>
                  <p>Content scoring currently optimized for English.</p>
                  <p className="text-sm italic">Non-English optimization: Q2 2026 when we hit 10% non-English usage.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q9">
                <AccordionTrigger className="text-left">
                  How often should I retest?
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>After major changes:</strong> Always</li>
                    <li><strong>Active sites:</strong> Monthly</li>
                    <li><strong>Stable sites:</strong> Quarterly</li>
                  </ul>
                  <p className="text-sm italic">Note: 7-day rate limit per URL to ensure diagnostic use.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <p className="text-sm text-muted-foreground mt-6">
              Technical question? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
            </p>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Frequently asked questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Why did my site score low?</h4>
              <p className="text-sm text-muted-foreground">
                The most common reasons are missing schema markup (especially Organization and Article schemas), unclear
                value propositions in the first 200 words, and lack of visible author credentials.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">How often can I retest?</h4>
              <p className="text-sm text-muted-foreground">
                Each URL can be retested after 7 days. This gives you time to implement changes. Made updates sooner?
                Contact us to request an early retest.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Is my data stored?</h4>
              <p className="text-sm text-muted-foreground">
                We store your test results to calculate industry averages and allow you to track progress. We never
                share individual results publicly without permission.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">What's a good score?</h4>
              <p className="text-sm text-muted-foreground">
                80+ is excellent (Grade A-B). 60-79 is average. Below 60 needs work. Most sites we test score between
                45-65.
              </p>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
