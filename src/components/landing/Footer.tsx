import { Button } from "@/components/ui/button";

interface FooterProps {
  onOpenFeedback?: () => void;
}

const Footer = ({ onOpenFeedback }: FooterProps) => {
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "mailto:hello@foundindex.com";
  };

  return (
    <footer className="py-16 px-4 bg-accent-gray-light border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Built by Richa Deo — UX researcher focused on how AI interprets information
          </p>
          <p className="text-sm text-muted-foreground">
            Contact:{" "}
            
              href="mailto:hello@foundindex.com"
              onClick={handleEmailClick}
              className="underline hover:text-foreground transition-colors cursor-pointer"
            >
              hello@foundindex.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Privacy-first: We don't store your website content. Test results and URLs are stored to improve analysis.
          </p>
          <p className="text-sm text-muted-foreground">Uses OpenAI models • Efficient by design</p>
          <div className="flex justify-center gap-4 pt-2">
            <a href="/privacy" className="hover:text-foreground transition-colors cursor-pointer">
              Privacy
            </a>
            <a href="/privacy" className="hover:text-foreground transition-colors cursor-pointer">
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