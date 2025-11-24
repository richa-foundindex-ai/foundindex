import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
            <Link to="/contact" className="underline hover:text-foreground transition-colors">
              Contact us
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Privacy-first: We don't store your website content. Test results and URLs are stored to improve analysis.
          </p>
          <p className="text-sm text-muted-foreground">Uses OpenAI models • Efficient by design</p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Terms
            </Link>
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
