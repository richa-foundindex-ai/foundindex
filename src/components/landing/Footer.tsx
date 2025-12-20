import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-accent-gray-light border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4">
          {/* Line 1: Main tagline */}
          <p className="text-lg font-bold text-foreground">
            <span className="text-foreground">Found</span>
            <span className="text-[#f13131]">Index</span>
            {" "}• AI visibility diagnostic for your website
          </p>
          
          {/* Line 2: Links */}
          <div className="flex justify-center items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <Link 
              to="/privacy" 
              className="hover:text-[#f13131] transition-colors"
            >
              Terms & Privacy
            </Link>
            <span>|</span>
            <Link 
              to="/contact" 
              className="hover:text-[#f13131] transition-colors"
            >
              Contact
            </Link>
            <span>|</span>
            <a
              href="https://www.linkedin.com/company/foundindex/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f13131] transition-colors"
            >
              LinkedIn
            </a>
            <span>|</span>
            <a
              href="https://foundindex.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f13131] transition-colors"
            >
              FoundIndex
            </a>
            <span>|</span>
            <a
              href="https://foundcandidate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f13131] transition-colors"
            >
              FoundCandidate
            </a>
            <span>|</span>
            <a
              href="https://foundmvp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f13131] transition-colors"
            >
              FoundMVP
            </a>
          </div>
          
          {/* Line 3: Copyright */}
          <p className="text-xs text-muted-foreground">
            © 2025 FoundIndex • Built by{" "}
            <a
              href="https://richadeo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f13131] transition-colors"
            >
              Richa Deo
            </a>
          </p>
          
          {/* Line 4: About Richa */}
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Richa Deo is a product builder and founder who builds production-ready MVPs and AI tools for founders, including FoundMVP, FoundIndex, and FoundCandidate.
          </p>
          
          {/* Line 5: About FoundIndex */}
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            FoundIndex measures how AI systems understand and recommend your business on a 0-100 scale. Schema.org compliant, WCAG 2.1 AA accessible, GDPR-structured, TypeScript-based architecture.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
