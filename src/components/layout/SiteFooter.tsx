import React from "react";
import { Link } from "react-router-dom";

const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-[#1F2937] text-[#9CA3AF] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top section with logo and navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <Link 
              to="/" 
              className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
              aria-label="FoundIndex homepage"
            >
              FoundIndex
            </Link>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Making websites legible to AI systems
            </p>
          </div>

          {/* Footer Navigation */}
          <nav 
            aria-label="Footer navigation"
            className="flex flex-wrap justify-center md:justify-end gap-6"
          >
            <Link
              to="/privacy"
              className="text-[#9CA3AF] hover:text-white hover:underline transition-colors"
              aria-label="Read our privacy policy"
            >
              Privacy
            </Link>
            <Link
              to="/privacy#terms"
              className="text-[#9CA3AF] hover:text-white hover:underline transition-colors"
              aria-label="Read our terms of service"
            >
              Terms
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-[#374151] pt-8">
          {/* Attribution and credits */}
          <div className="text-sm text-[#9CA3AF] text-center md:text-left space-y-2">
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

export default SiteFooter;
