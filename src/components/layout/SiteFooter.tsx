import React from "react";
import { Link } from "react-router-dom";

const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
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
            <p className="text-sm text-gray-400 mt-1">
              Making websites legible to AI systems
            </p>
          </div>

          {/* Footer Navigation */}
          <nav 
            aria-label="Footer navigation"
            className="flex flex-wrap justify-center md:justify-end gap-6"
          >
            <Link
              to="/methodology"
              className="text-gray-400 hover:text-white hover:underline transition-colors"
              aria-label="Learn about our AI readability methodology"
            >
              Methodology
            </Link>
            <Link
              to="/pricing"
              className="text-gray-400 hover:text-white hover:underline transition-colors"
              aria-label="View pricing for AI readability code package"
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className="text-gray-400 hover:text-white hover:underline transition-colors"
              aria-label="Contact FoundIndex support team"
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white hover:underline transition-colors"
              aria-label="Read our privacy policy"
            >
              Privacy
            </Link>
            <Link
              to="/privacy#terms"
              className="text-gray-400 hover:text-white hover:underline transition-colors"
              aria-label="Read our terms of service"
            >
              Terms
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          {/* Attribution and credits */}
          <div className="text-sm text-gray-400 text-center md:text-left space-y-2">
            <p>
              Built by Richa Deo • Content Strategist and UX Researcher with 14+ years experience
            </p>
            <p>
              llms.txt is a community standard by{" "}
              <a
                href="https://llmstxt.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 hover:underline transition-colors"
                aria-label="Visit llmstxt.org to learn more about the standard (opens in new tab)"
              >
                llmstxt.org
              </a>
            </p>
            <p className="text-gray-500">
              © {new Date().getFullYear()} FoundIndex. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
