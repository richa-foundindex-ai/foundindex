import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CoffeeBrewingLoader } from "./CoffeeBrewingLoader";
import { checkRateLimit, recordTest, releaseTestLock } from "@/utils/rateLimiting";
import { validateAndNormalizeUrl, getErrorMessage } from "@/utils/urlValidation";
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

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [showExistingTestModal, setShowExistingTestModal] = useState(false);
  const [existingTestInfo, setExistingTestInfo] = useState<ExistingTestInfo | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ url: string; score: number; remainingTests: number; testId?: string; daysUntilReset?: number } | null>(
    null,
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [urlSuggestion, setUrlSuggestion] = useState<string | null>(null);

  // Clear validation errors when input changes
  const handleInputChange = (value: string) => {
    setFormData({ ...formData, website: value });
    setValidationError(null);
    setUrlSuggestion(null);
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
      } else {
        const daysText = rateLimit.daysUntilReset === 1 ? "1 day" : `${rateLimit.daysUntilReset} days`;
        toast({
          title: "Weekly limit reached",
          description: `You've used all 10 tests this week. Your tests reset in ${daysText}.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Step 3: Check for existing test (server-side check)
    setIsCheckingExisting(true);
    try {
      const { data: existingData, error: existingError } = await supabase.functions.invoke("check-existing-test", {
        body: { website: websiteUrl },
      });

      if (!existingError && existingData?.exists) {
        console.log("[HeroSection] Found existing test:", existingData);
        // Release the rate limit lock since we're not running a new test
        releaseTestLock();
        setExistingTestInfo({
          testId: existingData.testId,
          score: existingData.score,
          website: existingData.website,
          testDate: existingData.testDate,
        });
        setShowExistingTestModal(true);
        setIsCheckingExisting(false);
        return;
      }
    } catch (error) {
      console.error("[HeroSection] Error checking existing test:", error);
      // Continue with new test if check fails
    }
    setIsCheckingExisting(false);

    // Step 4: Proceed with new test
    setIsSubmitting(true);

    try {
      const { data: submitData, error: submitError } = await supabase.functions.invoke("submit-test", {
        body: {
          website: websiteUrl,
        },
      });

      if (submitError) throw new Error(submitError.message);
      
      // Handle success: false responses with specific error types
      if (submitData?.success === false) {
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
          title: "Test started!",
          description: "Analyzing your website...",
        });
        navigate(`/results?testId=${submitData.testId}`);
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

  return (
    <>
      {isSubmitting && <CoffeeBrewingLoader website={formData.website} />}

      {/* Rate Limit Modal */}
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
                  id="website"
                  type="text"
                  placeholder="slack.com or https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange(e.target.value)}
                  required
                  className={`h-12 ${validationError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {validationError && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <span>{validationError}</span>
                      {urlSuggestion && (
                        <button
                          type="button"
                          onClick={applySuggestion}
                          className="ml-1 text-primary hover:underline font-medium"
                        >
                          Use "{urlSuggestion}"?
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isSubmitting || isCheckingExisting}>
                  {isCheckingExisting ? (
                    "Checking..."
                  ) : isSubmitting ? (
                    "Analyzing..."
                  ) : (
                    <>
                      Analyze my website →
                      <ArrowRight className="ml-2 h-5 w-5 hidden" />
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  <strong>10 free tests per week</strong> • Takes 3 minutes • No credit card required
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
