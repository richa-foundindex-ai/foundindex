import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!cookiesAccepted) {
      // Show banner after a brief delay for better UX
      setTimeout(() => {
        setIsVisible(true);
      }, 500);
    }
  }, []);

  const handleAccept = () => {
    // Set exit animation
    setIsExiting(true);
    
    // Store acceptance in localStorage
    localStorage.setItem('cookiesAccepted', 'true');
    
    // Initialize Google Analytics if configured
    // window.gtag?.('consent', 'update', {
    //   analytics_storage: 'granted'
    // });
    
    // Hide banner after animation completes
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        isExiting ? 'animate-fade-out translate-y-4 opacity-0' : 'animate-fade-in'
      }`}
    >
      <Card className="mx-auto max-w-[600px] p-4 shadow-lg border-border bg-background">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0" aria-label="Cookie">🍪</span>
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">
                We use cookies for analytics and to improve your experience.{" "}
                <Link 
                  to="/privacy" 
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAccept}
              className="flex-1 sm:flex-none"
              size="sm"
            >
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
