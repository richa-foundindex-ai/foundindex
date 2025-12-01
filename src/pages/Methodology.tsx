import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-background">
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
