import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface DiagnosticFormProps {
  onSuccess?: (url: string) => void;
  redirectOnSuccess?: boolean;
}

const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ 
  onSuccess,
  redirectOnSuccess = true 
}) => {
  const [url, setUrl] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const navigate = useNavigate();

  // Validate URL format
  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setErrorMessage("Please enter a website URL");
      return false;
    }

    // Normalize URL - add https:// if missing
    let normalizedUrl = value.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      const urlObj = new URL(normalizedUrl);
      // Check for valid protocol
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        setErrorMessage("URL must start with http:// or https://");
        return false;
      }
      // Check for valid hostname
      if (!urlObj.hostname || !urlObj.hostname.includes(".")) {
        setErrorMessage("Please enter a valid domain (e.g., example.com)");
        return false;
      }
      return true;
    } catch {
      setErrorMessage("Please enter a valid URL (e.g., https://example.com)");
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);
    setErrorMessage("");

    if (!validateUrl(url)) {
      setHasError(true);
      // Focus error message for screen readers
      setTimeout(() => errorRef.current?.focus(), 100);
      return;
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay for demo (remove in production)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess(normalizedUrl);
      }

      if (redirectOnSuccess) {
        navigate(`/results?url=${encodeURIComponent(normalizedUrl)}`);
      }
    } catch (error) {
      setHasError(true);
      setErrorMessage("Something went wrong. Please try again.");
      setTimeout(() => errorRef.current?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear error when user starts typing
    if (hasError) {
      setHasError(false);
      setErrorMessage("");
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape clears input
    if (e.key === "Escape" && url) {
      e.preventDefault();
      setUrl("");
      setHasError(false);
      setErrorMessage("");
      inputRef.current?.focus();
    }
  };

  // Focus input on mount
  useEffect(() => {
    // Only auto-focus on larger screens to avoid mobile keyboard popup
    if (window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <form 
      onSubmit={handleSubmit} 
      aria-label="Website AI readability test form"
      className="bg-white rounded-2xl p-6 md:p-8 shadow-lg"
    >
      {/* Label */}
      <label 
        htmlFor="url-input" 
        className="block text-[#2C3E50] font-medium mb-2"
      >
        Your Website URL
      </label>

      {/* Input */}
      <input
        ref={inputRef}
        type="url"
        id="url-input"
        name="url"
        value={url}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="https://yourcompany.com"
        required
        aria-required="true"
        aria-describedby="url-help url-error"
        aria-invalid={hasError ? "true" : "false"}
        disabled={isLoading}
        className={`
          w-full px-4 py-3 border rounded-xl text-[#2C3E50] text-lg
          transition-all duration-200
          focus:outline-none focus:ring-[3px] focus:ring-[#0A7C7C] focus:ring-offset-2 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${hasError 
            ? "border-red-500 bg-red-50" 
            : "border-gray-300 hover:border-gray-400"
          }
        `}
      />

      {/* Help text */}
      <p 
        id="url-help" 
        className="text-sm text-gray-500 mt-2"
      >
        Enter your homepage URL. We'll analyze 47 criteria.
      </p>

      {/* Error message */}
      {hasError && (
        <p
          ref={errorRef}
          id="url-error"
          className="text-red-600 text-sm mt-2 flex items-center gap-2"
          role="alert"
          aria-live="polite"
          tabIndex={-1}
        >
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {errorMessage}
        </p>
      )}

      {/* Success message */}
      {isSuccess && !redirectOnSuccess && (
        <p
          className="text-green-600 text-sm mt-2 flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          Analysis started! Redirecting to results...
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        aria-label={
          isLoading 
            ? "Analyzing your website, please wait" 
            : "Analyze my website for AI readability - Start free diagnostic"
        }
        className={`
          w-full mt-6 py-4 rounded-xl font-semibold text-lg
          transition-all duration-200
          focus:outline-none focus:ring-[3px] focus:ring-[#0A7C7C] focus:ring-offset-2
          flex items-center justify-center gap-2
          ${isLoading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-[#E67E22] text-white hover:bg-[#CF711F] cursor-pointer"
          }
        `}
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <span>Analyze My Site</span>
          </>
        )}
      </button>

      {/* Additional info */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Instant results • No signup • Free during beta
      </p>
    </form>
  );
};

export default DiagnosticForm;
