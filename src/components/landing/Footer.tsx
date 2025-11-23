import { Button } from "@/components/ui/button";

interface FooterProps {
  onOpenFeedback?: () => void;
}

const Footer = ({ onOpenFeedback }: FooterProps) => {

  return (
    <footer className="py-16 px-4 bg-accent-gray-light border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-3 text-sm text-muted-foreground">
          <p>
            Built by Richa Deo — UX researcher focused on how AI interprets information
          </p>
          <p>
            Contact: <a href="mailto:hello@foundindex.com" className="hover:text-foreground transition-colors cursor-pointer">hello@foundindex.com</a>
          </p>
          <p>
            Uses OpenAI models • We don't store your website content
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          {onOpenFeedback && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={onOpenFeedback}
                className="text-sm"
              >
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
