import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "mailto:hello@foundindex.com";
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <Card className="max-w-3xl mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">Privacy & Terms</h1>

        <div className="space-y-6">
          <p className="text-muted-foreground">FoundIndex is in beta.</p>

          <div>
            <h3 className="font-semibold text-foreground mb-3">What we store:</h3>
            <ul className="space-y-2 ml-4 text-muted-foreground">
              <li>• URLs tested, scores, and feedback you provide</li>
              <li>• Email addresses only if you opt in for updates or feedback</li>
              <li>• Test metadata for analysis improvement</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">What we don't store:</h3>
            <ul className="space-y-2 ml-4 text-muted-foreground">
              <li>• Your website content or HTML</li>
              <li>• Personal data scraped from your site</li>
              <li>• Payment information (v1 is free)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">How we use data:</h3>
            <ul className="space-y-2 ml-4 text-muted-foreground">
              <li>• Product improvement and algorithm refinement only</li>
              <li>• Analysis powered by OpenAI models</li>
              <li>• We never sell your information</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Data retention:</h3>
            <ul className="space-y-2 ml-4 text-muted-foreground">
              <li>• Test results stored for 12 months, then anonymized</li>
              <li>• Waitlist emails retained until you unsubscribe</li>
            </ul>
          </div>

          <p className="pt-4 text-muted-foreground">
            Questions? Email:{" "}
            <a
              href="mailto:hello@foundindex.com"
              onClick={handleEmailClick}
              className="text-primary hover:underline cursor-pointer"
            >
              hello@foundindex.com
            </a>
          </p>

          <p className="text-muted-foreground">Full privacy policy coming with v2 launch.</p>
        </div>

        <div className="pt-6">
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Privacy;
