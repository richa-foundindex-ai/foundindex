import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy & Terms - FoundIndex</title>
        <meta name="description" content="FoundIndex privacy policy and terms of service. How we handle your data." />
      </Helmet>
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Privacy & terms</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          {/* Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Privacy policy</h2>
            <p className="text-sm text-muted-foreground mb-6">Last updated: November 2025</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. What we collect</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Website URLs you submit for analysis</li>
                  <li>Email address (if provided)</li>
                  <li>Test results and scores</li>
                  <li>Feedback you submit</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">2. How we use it</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Generate your AI visibility analysis</li>
                  <li>Calculate industry averages</li>
                  <li>Improve our scoring algorithms</li>
                  <li>Send you results and updates (if opted in)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">3. What we don't do</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Sell your data to third parties</li>
                  <li>Share individual results publicly without permission</li>
                  <li>Store passwords or sensitive credentials</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">4. Cookies</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Analytics cookies (Google Analytics)</li>
                  <li>Session cookies for rate limiting</li>
                  <li>Can be disabled in browser settings</li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="my-8" />

          {/* Terms of Service */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Terms of service</h2>
            <p className="text-sm text-muted-foreground mb-6">Last updated: December 2025</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Service description</h3>
                <p className="text-muted-foreground">
                  FoundIndex provides AI visibility scoring for websites. We analyze publicly accessible web pages and
                  provide recommendations to improve how AI search engines understand your content.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">2. Account & access</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>No account is required for basic use</li>
                  <li>Email submission unlocks full results</li>
                  <li>One analysis per URL every 7 days</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">3. Acceptable use</h3>
                <p className="text-muted-foreground mb-2">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Submit URLs you don't have permission to analyze</li>
                  <li>Attempt to circumvent rate limits</li>
                  <li>Use automated tools for bulk submissions</li>
                  <li>Reverse engineer our scoring algorithms</li>
                  <li>Misrepresent FoundIndex scores as official rankings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">4. Intellectual property</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Our scoring methodology, algorithms, and recommendations are proprietary</li>
                  <li>You may share your own scores publicly</li>
                  <li>You may not claim affiliation with FoundIndex without permission</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">5. Disclaimer of warranties</h3>
                <p className="text-muted-foreground mb-2">
                  FoundIndex is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Improved rankings in any search engine</li>
                  <li>Accuracy of all recommendations for your specific situation</li>
                  <li>Uninterrupted service availability</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">6. Limitation of liability</h3>
                <p className="text-muted-foreground">
                  FoundIndex and its creators shall not be liable for any indirect, incidental, or consequential damages arising from use of this service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">7. Beta service notice</h3>
                <p className="text-muted-foreground">
                  FoundIndex is currently in beta. Features, pricing, and availability may change without notice. We appreciate your feedback as we improve.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">8. Changes to terms</h3>
                <p className="text-muted-foreground">
                  We may update these terms at any time. Continued use constitutes acceptance of updated terms.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">9. Contact</h3>
                <p className="text-muted-foreground">
                  For questions about these terms:{" "}
                  <Link to="/contact" className="text-link">
                    Contact us
                  </Link>
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8" />

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact</h2>
            <p className="text-muted-foreground mb-4">For privacy-related questions or any other inquiries:</p>
            <Link to="/contact">
              <Button variant="outline">Contact us</Button>
            </Link>
          </section>
        </div>

        <div className="mt-12">
          <Link to="/">
            <Button>Return home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
