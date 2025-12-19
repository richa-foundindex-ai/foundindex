import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FooterProps {
  onOpenFeedback?: () => void;
}

const Footer = ({ onOpenFeedback }: FooterProps) => {
  return (
    <footer className="py-12 px-4 bg-[#1F2937] text-[#9CA3AF]">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-6">
          {/* Brand */}
          <div>
            <Link to="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
              FoundIndex
            </Link>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Making websites legible to AI systems
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy" className="text-[#9CA3AF] hover:text-white hover:underline transition-colors">
              Privacy
            </Link>
            <Link to="/privacy#terms" className="text-[#9CA3AF] hover:text-white hover:underline transition-colors">
              Terms
            </Link>
          </div>

          {/* Attribution */}
          <div className="text-sm space-y-2 pt-4 border-t border-[#374151]">
            <p>
              Built by Richa Deo — Product Builder & Founder of FoundMVP
            </p>
            <p className="text-[#6B7280]">
              llms.txt follows the emerging community standard for AI-readable context files
            </p>
            <p className="text-[#6B7280]">
              © 2025 FoundIndex. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
