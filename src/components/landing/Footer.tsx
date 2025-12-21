import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-accent-gray-light border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4">
          {/* Line 1: Site name + tagline */}
          <p className="text-lg text-foreground">
            <span className="font-bold text-foreground">Found</span>
            <span className="font-bold text-[#f13131]">Index</span>
            {" "}• How AI systems interpret and understand websites
          </p>
          
          {/* Line 2: Navigation links */}
          <div className="flex justify-center items-center gap-2 flex-wrap text-sm text-muted-foreground">
            <Link 
              to="/privacy" 
              className="hover:text-[#f13131] transition-colors"
            >
              Terms & Privacy
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link 
              to="/contact" 
              className="hover:text-[#f13131] transition-colors"
            >
              Contact
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <a
              href="https://www.linkedin.com/in/richa-deo/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f13131] transition-colors"
            >
              LinkedIn
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a
              href="https://foundmvp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f13131] transition-colors"
            >
              FoundMVP
            </a>
            <span className="text-muted-foreground/50">|</span>
            <a
              href="https://foundcandidate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f13131] transition-colors"
            >
              FoundCandidate
            </a>
          </div>
          
          {/* Line 3: Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2025 FoundIndex • Built by Richa Deo
          </p>
          
          {/* Line 4: About Richa */}
          <p className="text-xs text-muted-foreground/70 max-w-2xl mx-auto">
            Richa Deo is a product builder and founder who builds production-ready MVPs and AI tools for founders, including FoundMVP, FoundIndex, and FoundCandidate.
          </p>
          
          {/* Line 5: About FoundIndex */}
          <p className="text-xs text-muted-foreground/70 max-w-2xl mx-auto">
            FoundIndex examines how AI tools interpret website structure and content. It highlights gaps that prevent accurate understanding and visibility in AI-driven search.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
