import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  const handleHomeClick = () => {
    // Clear stored results URL when navigating to home
    sessionStorage.removeItem('foundindex_results_url');
  };
  
  const navLinks = [
    { to: "/", label: "Home", onClick: handleHomeClick },
    { to: "/methodology", label: "Methodology" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          onClick={handleHomeClick}
          className="text-xl font-bold text-foreground hover:text-primary transition-colors"
        >
          FoundIndex
        </Link>
        
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={link.onClick}
              className={`text-sm font-medium transition-colors hover:text-link ${
                location.pathname === link.to
                  ? "text-link"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
