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
            Privacy-first • We don't store your website content
          </p>
          <p className="text-sm text-muted-foreground">Powered by OpenAI</p>
          <div className="flex justify-center gap-4 pt-2 flex-wrap">
            <Link to="/methodology" className="text-link hover:underline text-sm">
              Methodology
            </Link>
            <Link to="/privacy" className="text-link hover:underline text-sm">
              Privacy
            </Link>
            <Link to="/contact" className="text-link hover:underline text-sm">
              Contact
            </Link>
            {onOpenFeedback && (
              <button 
                onClick={onOpenFeedback} 
                className="text-sm bg-transparent border-0 p-0 cursor-pointer"
                style={{ color: 'hsl(217 91% 60%)' }}
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
