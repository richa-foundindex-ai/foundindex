import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import { XCircle } from "lucide-react";
import { analytics } from "@/utils/analytics";

const Privacy = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    analytics.pageView("privacy");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card className="p-8 space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>

          <div className="space-y-8">
            {/* What We Collect */}
            <section>
              <h2 className="text-2xl font-bold mb-4">1. What We Collect</h2>
              <ul className="space-y-2 ml-4 text-muted-foreground">
                <li>• Website URLs you test</li>
                <li>• Email addresses (if provided)</li>
                <li>• Test results and scores</li>
                <li>• Usage analytics</li>
              </ul>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Data</h2>
              <ul className="space-y-2 ml-4 text-muted-foreground">
                <li>• Provide FI Score analysis</li>
                <li>• Send test results</li>
                <li>• Improve our algorithm</li>
                <li>• Send product updates (opt-out available)</li>
              </ul>
            </section>

            {/* What We Don't Do */}
            <section>
              <h2 className="text-2xl font-bold mb-4">3. What We Don't Do</h2>
              <div className="space-y-2 ml-4">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Sell data to third parties</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Share your URLs publicly</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Use your content to train AI models</span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Send spam</span>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
              <ul className="space-y-2 ml-4 text-muted-foreground">
                <li>• Test results: 12 months</li>
                <li>• Email addresses: Until unsubscribe</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
              <ul className="space-y-2 ml-4 text-muted-foreground">
                <li>• Request data deletion</li>
                <li>• Export test history</li>
                <li>• Unsubscribe anytime</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
              <ul className="space-y-2 ml-4 text-muted-foreground">
                <li>• Analytics cookies (Google Analytics)</li>
                <li>• Session cookies</li>
                <li>• Can be disabled in browser</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold mb-4">7. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For privacy-related questions, email us at:{" "}
                <a href="mailto:hello@foundindex.com" className="text-blue-600 hover:underline dark:text-blue-400">
                  hello@foundindex.com
                </a>
              </p>
            </section>
          </div>

          <div className="pt-6 border-t">
            <Button asChild>
              <Link to="/">Return home</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
