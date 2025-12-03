import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FooterProps {
  onOpenFeedback?: () => void;
}

const Footer = ({ onOpenFeedback }: FooterProps) => {
  return (
    <footer className="py-12 px-4 bg-accent-gray-light border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-2 flex-wrap text-sm text-muted-foreground">
            <span>FoundIndex © 2025</span>
            <span className="text-gray-300">•</span>
            <span>
              Created by{" "}
              <a
                href="https://richadeo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-foreground transition-colors"
              >
                Richa Deo
              </a>
            </span>
          </div>
          <div className="flex justify-center gap-4 flex-wrap text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
              Privacy & Terms
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
              Contact
            </Link>
            <Link to="/methodology" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
              Methodology
            </Link>
            {onOpenFeedback && (
              <button
                onClick={onOpenFeedback}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors bg-transparent border-0 p-0 cursor-pointer"
              >
                Give Feedback
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
