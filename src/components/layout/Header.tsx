import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleHomeClick = () => {
    // Clear stored results URL when navigating to home
    sessionStorage.removeItem('foundindex_results_url');
    setIsOpen(false);
  };
  
  const navLinks = [
    { to: "/methodology", label: "Methodology" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          onClick={handleHomeClick}
          className="text-xl font-bold hover:opacity-80 transition-opacity"
        >
          <span className="text-foreground">Found</span>
          <span className="text-[#f13131]">Index</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-link ${
                location.pathname === link.to
                  ? "text-link"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link 
            to="/" 
            onClick={() => {
              setTimeout(() => {
                document.getElementById('url-input-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            <Button className="bg-[#f13131] hover:bg-[#d92b2b] text-white font-semibold px-5">
              Get your FI Score
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-link ${
                    location.pathname === link.to
                      ? "text-link"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                to="/" 
                onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => {
                    document.getElementById('url-input-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                <Button className="bg-[#f13131] hover:bg-[#d92b2b] text-white font-semibold w-full">
                  Get your FI Score
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
