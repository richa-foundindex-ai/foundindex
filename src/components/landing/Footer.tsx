import { Button } from "@/components/ui/button";

interface FooterProps {
  onOpenFeedback?: () => void;
}

const Footer = ({ onOpenFeedback }: FooterProps) => {
  return (
    <footer className="py-16 px-4 bg-accent-gray-light border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Built by Richa Deo — UX researcher focused on how AI interprets information
          </p>
          <p className="text-sm text-muted-foreground">
            Contact:{" "}
            <a href="mailto:hello@foundindex.com" className="underline hover:text-foreground transition-colors">
              hello@foundindex.com
            </a>{" "}
            <button
              onClick={() => {
                navigator.clipboard.writeText("hello@foundindex.com");
                alert("📧 Email copied: hello@foundindex.com");
              }}
              className="text-xs text-primary hover:underline ml-1"
            >
              (copy)
            </button>
          </p>
          <p className="text-sm text-muted-foreground">
            Privacy-first: We don't store your website content. Test results and URLs are stored to improve analysis.
          </p>
          <p className="text-sm text-muted-foreground">Uses OpenAI models • Efficient by design</p>
          <div className="flex justify-center gap-4 pt-2">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
          {onOpenFeedback && (
            <div className="pt-4">
              <Button variant="outline" onClick={onOpenFeedback} className="text-sm">
                Give Feedback
              </Button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
