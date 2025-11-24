import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
        <Card className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Privacy & Terms</h1>

        <div className="space-y-6">
          <p className="text-muted-foreground">FoundIndex beta - Data policy</p>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Stored data:</h3>
            <ul className="space-y-2 ml-4 text-muted-foreground">
              <li>• Test URLs, scores, user feedback</li>
              <li>• Emails (opt-in only for updates/evaluations)</li>
              <li>• Analysis metadata (algorithm optimization)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Never stored:</h3>
            <ul className="space-y-2 ml-4 text-muted-foreground">
              <li>• Website HTML or content</li>
              <li>• Scraped personal data</li>
              <li>• Payment information (beta = free access)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Data usage:</h3>
            <ul className="space-y-2 ml-4 text-muted-foreground">
              <li>• Algorithm refinement exclusively</li>
              <li>• OpenAI-powered analysis</li>
              <li>• Zero third-party sales</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Retention policy:</h3>
            <ul className="space-y-2 ml-4 text-muted-foreground">
              <li>• Test results: 12-month storage, then anonymized</li>
              <li>• Email lists: Retained until unsubscribe</li>
            </ul>
          </div>

          <p className="pt-4 text-muted-foreground">
            Questions?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact
            </Link>
          </p>

          <p className="text-muted-foreground">Complete privacy policy launches with v2.</p>
        </div>

        <div className="pt-6">
          <Button asChild>
            <Link to="/">Return home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Privacy;
