import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CoffeeBrewingLoader } from "./CoffeeBrewingLoader";
import { checkRateLimit, recordTest, releaseTestLock } from "@/utils/rateLimiting";
import { validateAndNormalizeUrl, getErrorMessage } from "@/utils/urlValidation";
import { analytics } from "@/utils/analytics";
import { RetestModal } from "@/components/RetestModal";
import { isStructuredError, ErrorResponse } from "@/utils/errorTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExistingTestInfo {
  testId: string;
  score: number;
  website: string;
  testDate: string;
}

interface RetestModalState {
  open: boolean;
  url: string;
  lastTestedDate: Date;
  nextAvailableDate: Date;
  cachedTestId: string;
  cachedScore: number;
}

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast, dismiss } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [showExistingTestModal, setShowExistingTestModal] = useState(false);
  const [existingTestInfo, setExistingTestInfo] = useState<ExistingTestInfo | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ url: string; score: number; remainingTests: number; testId?: string; daysUntilReset?: number; resetDate?: string } | null>(
    null,
  );
  const [showMonthlyLimitModal, setShowMonthlyLimitModal] = useState(false);
  const [monthlyLimitResetDate, setMonthlyLimitResetDate] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [urlSuggestion, setUrlSuggestion] = useState<string | null>(null);
  
  // Retest modal state for 7-day URL cooldown
  const [retestModal, setRetestModal] = useState<RetestModalState>({
    open: false,
    url: "",
    lastTestedDate: new Date(),
    nextAvailableDate: new Date(),
    cachedTestId: "",
    cachedScore: 0,
  });

  // Clear validation errors and dismiss toasts when input changes
  const handleInputChange = (value: string) => {
    setFormData({ ...formData, website: value });
    setValidationError(null);
    setUrlSuggestion(null);
    dismiss(); // Dismiss all toasts when user starts typing
  };
  
  // Dismiss toasts when input is focused
  const handleInputFocus = () => {
    dismiss();
  };

  // Apply URL suggestion
  const applySuggestion = () => {
    if (urlSuggestion) {
      setFormData({ ...formData, website: urlSuggestion });
      setValidationError(null);
      setUrlSuggestion(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setUrlSuggestion(null);
    
    // Dismiss all toasts BEFORE starting new analysis
    dismiss();
    
    analytics.buttonClick('Analyze Website', 'hero_section');

    if (!formData.website) {
      setValidationError("Please enter your website URL");
      return;
    }

    // Step 1: Instant client-side validation
    const validation = validateAndNormalizeUrl(formData.website);
    
    if (!validation.valid) {
      const errorMsg = getErrorMessage(validation);
      setValidationError(errorMsg.description);
      if (validation.suggestion) {
        setUrlSuggestion(validation.suggestion);
      }
      return;
    }

    const websiteUrl = validation.normalizedUrl!;

    // Step 2: Check rate limiting (local check)
    const rateLimit = checkRateLimit(websiteUrl);
    if (!rateLimit.allowed) {
      // Check if it's a lock error (another test in progress)
      if ('message' in rateLimit && rateLimit.message) {
        toast({
          title: "Test in progress",
          description: rateLimit.message,
          variant: "destructive",
        });
        return;
      }
      
      // If user tested this URL recently, show existing results
      if (rateLimit.previousScore !== undefined) {
        setRateLimitInfo({
          url: websiteUrl,
          score: rateLimit.previousScore,
          remainingTests: rateLimit.remainingTests,
          testId: rateLimit.testId,
          daysUntilReset: rateLimit.daysUntilReset,
        });
        setShowRateLimitModal(true);
        return;
      }
      
      // Monthly limit reached
      if ('resetDate' in rateLimit && rateLimit.resetDate) {
        setMonthlyLimitResetDate(rateLimit.resetDate);
        setShowMonthlyLimitModal(true);
        return;
      }
    }

    // Step 3: Duplicate URL detection DISABLED (beta phase)
    // Users can test the same URL multiple times

    // Step 4: Proceed with new test
    setIsSubmitting(true);

    try {
      const { data: submitData, error: submitError } = await supabase.functions.invoke("analyze-website", {
        body: {
          website: websiteUrl,
          testType: "homepage",
        },
      });

      if (submitError) throw new Error(submitError.message);
      
      // Handle success: false responses with specific error types
      if (submitData?.success === false) {
        // Check for structured error response (new format)
        if (isStructuredError(submitData)) {
          const errorData = submitData as ErrorResponse;
          
          // Handle RATE_LIMIT_URL with modal instead of toast
          if (errorData.error_type === "RATE_LIMIT_URL" && errorData.cached_test_id) {
            const lastTestedDate = errorData.cached_created_at ? new Date(errorData.cached_created_at) : new Date();
            const nextAvailableDate = errorData.next_available_time ? new Date(errorData.next_available_time) : new Date(lastTestedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            setRetestModal({
              open: true,
              url: websiteUrl,
              lastTestedDate,
              nextAvailableDate,
              cachedTestId: errorData.cached_test_id,
              cachedScore: errorData.cached_score || 0,
            });
            releaseTestLock();
            setIsSubmitting(false);
            return;
          }
          
          // Handle other structured errors with toast
          toast({
            title: errorData.error_type === "RATE_LIMIT_IP" ? "Daily limit reached" :
                   errorData.error_type === "SITE_UNREACHABLE" ? "Website not reachable" :
                   errorData.error_type === "BOT_BLOCKED" ? "Access blocked" :
                   errorData.error_type === "TIMEOUT" ? "Request timeout" :
                   errorData.error_type === "API_QUOTA" ? "Service temporarily unavailable" :
                   "Analysis issue",
            description: errorData.user_message,
            variant: "destructive",
          });
          releaseTestLock();
          setIsSubmitting(false);
          return;
        }
        
        // Legacy error format handling
        const errorType = submitData.errorType || 'unknown';
        let errorTitle = submitData.error || "Analysis issue";
        let errorDescription = submitData.details || "Unable to analyze this website";
        
        // Customize error messages based on error type
        switch (errorType) {
          case 'fetch_failed':
            errorTitle = "Website not reachable";
            errorDescription = "We couldn't access this website. Please check the URL is correct and the site is online.";
            break;
          case 'js_rendered_site':
            errorTitle = "JavaScript-heavy website";
            errorDescription = "This website loads content with JavaScript. We tried our best but couldn't extract enough content. Try a different page URL or contact support.";
            break;
          case 'analysis_failed':
            errorTitle = "Analysis error";
            errorDescription = "We encountered an issue analyzing this website. Please try again or contact support if this persists.";
            break;
          case 'rate_limit':
            errorTitle = "High demand";
            errorDescription = submitData.details || "Our AI analysis service is experiencing high demand. Please try again in a few minutes.";
            break;
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });
        // Don't count failed analyses against rate limit
        releaseTestLock();
        setIsSubmitting(false);
        return;
      }
      
      // Handle legacy error format
      if (submitData?.error && !submitData?.testId) {
        releaseTestLock();
        throw new Error(submitData.details || submitData.error);
      }

      if (submitData?.testId) {
        // Clear any stored results URL when starting a new test
        sessionStorage.removeItem('foundindex_results_url');
        
        // Record the test in cookie and localStorage
        recordTest(websiteUrl, submitData.score || 0, submitData.testId);
        localStorage.setItem('lastTestId', submitData.testId);
        localStorage.setItem('lastTestedUrl', websiteUrl);

        toast({
          title: "Test complete!",
          description: "Loading your analysis results...",
        });
        navigate(`/results?testId=${submitData.testId}&url=${encodeURIComponent(websiteUrl)}`);
      }
    } catch (error) {
      console.error("[HeroSection] Submit error:", error);
      releaseTestLock();
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetestModalClose = () => {
    setRetestModal(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      {isSubmitting && <CoffeeBrewingLoader website={formData.website} />}
      
      {/* 7-Day URL Retest Modal */}
      <RetestModal
        open={retestModal.open}
        onClose={handleRetestModalClose}
        url={retestModal.url}
        lastTestedDate={retestModal.lastTestedDate}
        nextAvailableDate={retestModal.nextAvailableDate}
        cachedTestId={retestModal.cachedTestId}
        cachedScore={retestModal.cachedScore}
      />

      {/* Monthly Limit Modal */}
      <AlertDialog open={showMonthlyLimitModal} onOpenChange={setShowMonthlyLimitModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Monthly test limit reached</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  You've used all 10 free tests this month. Your limit resets on{" "}
                  <strong>
                    {monthlyLimitResetDate 
                      ? new Date(monthlyLimitResetDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'soon'}
                  </strong>.
                </p>
                <p className="text-base font-semibold text-foreground">
                  Want unlimited tests?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowMonthlyLimitModal(false);
                navigate('/pricing');
              }}
            >
              Apply to be a beta partner →
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* URL Cooldown Modal */}
      <AlertDialog open={showRateLimitModal} onOpenChange={setShowRateLimitModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You tested this URL recently</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                You can test this URL again in {rateLimitInfo?.daysUntilReset === 1 ? "1 day" : `${rateLimitInfo?.daysUntilReset} days`}. Your score won't change significantly unless you update your homepage content.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowRateLimitModal(false);
                if (rateLimitInfo?.testId) {
                  navigate(`/results?testId=${rateLimitInfo.testId}`);
                }
              }}
            >
              View Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Existing Test Modal */}
      <AlertDialog open={showExistingTestModal} onOpenChange={setShowExistingTestModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>This website was recently analyzed</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Here's your previous score: <span className="text-2xl font-bold text-primary">{existingTestInfo?.score}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Tested on {existingTestInfo?.testDate ? new Date(existingTestInfo.testDate).toLocaleDateString() : 'recently'}
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  <Link to="/contact" className="text-link hover:underline">
                    Need to re-test? Contact us
                  </Link>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowExistingTestModal(false);
                if (existingTestInfo?.testId) {
                  navigate(`/results?testId=${existingTestInfo.testId}`);
                }
              }}
            >
              View full results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-6">
            <h1 className="text-[2.56rem] md:text-[3.33rem] font-bold text-foreground leading-tight">
              <span className="font-extrabold">Stop being invisible to AI.</span>
              <br />
              Analyze your website's visibility score in 3 minutes.
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              When people ask ChatGPT or Claude for recommendations, does your business show up? Most don't know. And that silence costs opportunities.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="flex items-start gap-3 text-left">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                <span className="text-base text-muted-foreground">See how AI systems understand your business</span>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                <span className="text-base text-muted-foreground">Get specific, actionable recommendations</span>
              </div>
            </div>
          </div>

          <Card className="max-w-xl mx-auto mt-12 p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-base font-medium">
                  Website URL
                </Label>
                <Input
                  ref={inputRef}
                  id="website"
                  type="text"
                  placeholder="slack.com or https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={handleInputFocus}
                  required
                  className={`h-12 min-h-[48px] ${validationError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  style={{ fontSize: '16px' }}
                  aria-label="Website URL"
                  aria-invalid={!!validationError}
                  aria-describedby={validationError ? "url-error" : undefined}
                />
                {validationError && (
                  <div id="url-error" className="flex items-start gap-2 text-sm text-destructive" role="alert">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <span>{validationError}</span>
                      {urlSuggestion && (
                        <button
                          type="button"
                          onClick={applySuggestion}
                          className="ml-1 text-primary hover:underline font-medium"
                          aria-label={`Use suggested URL: ${urlSuggestion}`}
                        >
                          Use "{urlSuggestion}"?
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 min-h-[48px] text-lg" 
                  disabled={isSubmitting || isCheckingExisting}
                  aria-label={isSubmitting ? "Analyzing website" : "Analyze my website"}
                >
                  {isCheckingExisting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      Checking...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      Analyzing... (~3 min)
                    </>
                  ) : (
                    <>
                      Analyze my website →
                      <ArrowRight className="ml-2 h-5 w-5 hidden" aria-hidden="true" />
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  <strong>10 free tests per month</strong> • Takes 3 minutes • No credit card required
                </p>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
