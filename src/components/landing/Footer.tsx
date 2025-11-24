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
            Built by Richa Deo — UX Researcher | 14+ years analyzing information interpretation | Former Indian Navy JAG officer
          </p>
          <p className="text-sm text-muted-foreground">
            <Link to="/contact" className="underline hover:text-foreground transition-colors">
              Contact
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Privacy-first: Zero content storage. Results and URLs retained for analysis optimization only.
          </p>
          <p className="text-sm text-muted-foreground">Powered by OpenAI • Optimized for speed</p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/methodology" className="hover:text-foreground transition-colors text-sm">
              Methodology
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors text-sm">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors text-sm">
              Privacy
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors text-sm">
              Terms
            </Link>
            {onOpenFeedback && (
              <button 
                onClick={onOpenFeedback} 
                className="hover:text-foreground transition-colors text-sm"
              >
                Share Feedback
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
