import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";

export function RateLimitBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden until we check

  useEffect(() => {
    const dismissed = localStorage.getItem("fi_rate_banner_dismissed");
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("fi_rate_banner_dismissed", "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mx-4 mb-6 max-w-5xl lg:mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Free beta limits:</strong> Homepage audits unlimited • Blog posts 3/month • 7-day cooldown per URL
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
