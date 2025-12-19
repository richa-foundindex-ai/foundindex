import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  onScrollToSection?: (id: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onScrollToSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  const isActivePage = (path: string) => location.pathname === path;

  const handleScrollToSection = (id: string) => {
    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  // Close menu on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && mobileMenuOpen) {
      setMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  // Focus trap for mobile menu
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!mobileMenuOpen || e.key !== "Tab") return;

    const focusableElements = menuRef.current?.querySelectorAll(
      'a[href], button:not([disabled])'
    );
    
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleTabKey);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [handleKeyDown, handleTabKey]);

  // Focus first menu item when opened
  useEffect(() => {
    if (mobileMenuOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [mobileMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const linkBaseClasses = "transition-colors duration-200";
  const linkDefaultClasses = "text-[#2C3E50] hover:text-[#0A7C7C]";
  const linkActiveClasses = "text-[#0A7C7C] underline underline-offset-4";

  return (
    <nav 
      aria-label="Main navigation" 
      className="bg-white border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-xl font-bold text-[#2C3E50] hover:text-[#0A7C7C] transition-colors"
            aria-label="FoundIndex homepage"
          >
            FoundIndex
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/methodology"
              className={`${linkBaseClasses} ${isActivePage("/methodology") ? linkActiveClasses : linkDefaultClasses}`}
              aria-label="Learn about our AI readability methodology"
              aria-current={isActivePage("/methodology") ? "page" : undefined}
            >
              Methodology
            </Link>
            <Link
              to="/contact"
              className={`${linkBaseClasses} ${isActivePage("/contact") ? linkActiveClasses : linkDefaultClasses}`}
              aria-label="Contact FoundIndex support team"
              aria-current={isActivePage("/contact") ? "page" : undefined}
            >
              Contact
            </Link>
            <button
              onClick={() => handleScrollToSection("free-tool")}
              className="bg-[#E67E22] text-white px-4 py-2 rounded-lg hover:bg-[#CF711F] transition-colors font-medium"
              aria-label="Test your website for AI readability"
            >
              Test Free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            className="md:hidden p-2 text-[#2C3E50] hover:text-[#0A7C7C] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          ref={menuRef}
          className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} py-4 border-t border-gray-100`}
          aria-hidden={!mobileMenuOpen}
          role="menu"
        >
          <Link
            ref={firstFocusableRef}
            to="/methodology"
            className={`block py-3 ${linkBaseClasses} ${isActivePage("/methodology") ? linkActiveClasses : linkDefaultClasses}`}
            aria-label="Learn about our AI readability methodology"
            aria-current={isActivePage("/methodology") ? "page" : undefined}
            onClick={() => setMobileMenuOpen(false)}
            role="menuitem"
          >
            Methodology
          </Link>
          <Link
            to="/contact"
            className={`block py-3 ${linkBaseClasses} ${isActivePage("/contact") ? linkActiveClasses : linkDefaultClasses}`}
            aria-label="Contact FoundIndex support team"
            aria-current={isActivePage("/contact") ? "page" : undefined}
            onClick={() => setMobileMenuOpen(false)}
            role="menuitem"
          >
            Contact
          </Link>
          <button
            ref={lastFocusableRef}
            onClick={() => handleScrollToSection("free-tool")}
            className="block w-full text-left py-3 text-[#E67E22] font-medium hover:text-[#CF711F] transition-colors"
            aria-label="Test your website for AI readability"
            role="menuitem"
          >
            Test Free
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
