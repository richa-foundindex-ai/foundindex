import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { useToast } from "@/hooks/use-toast";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Methodology from "./pages/Methodology";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to dismiss toasts on route change (only when navigating away)
function ToastDismissOnNavigate() {
  const location = useLocation();
  const { dismiss } = useToast();
  const previousPathRef = React.useRef(location.pathname);

  useEffect(() => {
    // Only dismiss toasts when NAVIGATING to a different route, not on mount
    if (previousPathRef.current !== location.pathname) {
      dismiss();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname, dismiss]);

  return null;
}

const AppRoutes = () => (
  <>
    <ToastDismissOnNavigate />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/results" element={<Results />} />
      <Route path="/methodology" element={<Methodology />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <CookieConsent />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
