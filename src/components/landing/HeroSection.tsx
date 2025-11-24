import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CoffeeBrewingLoader } from "./CoffeeBrewingLoader";
import { checkRateLimit, recordTest } from "@/utils/rateLimiting";
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

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ url: string; score: number; remainingTests: number; testId?: string } | null>(
    null,
  );

  const normalizeUrl = (input: string): string | null => {
    let url = input.trim();

    // Add https:// if no protocol is present
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Validate URL format
    try {
      new URL(url);
      return url;
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.website) {
      toast({
        title: "Missing information",
        description: "Please enter your website URL",
        variant: "destructive",
      });
      return;
    }

    const websiteUrl = normalizeUrl(formData.website);

    if (!websiteUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
      return;
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(websiteUrl);
    if (!rateLimit.allowed) {
      if (rateLimit.previousScore !== undefined) {
        setRateLimitInfo({
          url: websiteUrl,
          score: rateLimit.previousScore,
          remainingTests: rateLimit.remainingTests,
          testId: rateLimit.testId,
        });
        setShowRateLimitModal(true);
        return;
      } else {
        toast({
          title: "Weekly limit reached",
          description: "You've used all 3 tests for this week. Come back in 7 days!",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: submitData, error: submitError } = await supabase.functions.invoke("submit-test", {
        body: {
          website: websiteUrl,
        },
      });

      if (submitError) throw new Error(submitError.message);
      if (submitData?.error) throw new Error(submitData.error);

      if (submitData?.testId) {
        // Record the test in cookie
        recordTest(websiteUrl, submitData.score || 0, submitData.testId);

        toast({
          title: "Test started!",
          description: "Analyzing your website...",
        });
        navigate(`/results?testId=${submitData.testId}`);
      }
    } catch (error) {
      console.error("[HeroSection] Submit error:", error);
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
            <AlertDialogDescription className="space-y-4">
              <p className="text-lg font-semibold">Score: {rateLimitInfo?.score}/100</p>
              <p>Your score won't change unless you update your homepage content.</p>
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

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-6">
            <h1 className="text-[2.56rem] md:text-[3.33rem] font-bold text-foreground leading-tight">
              How visible is your business to AI?
            </h1>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 text-left">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base text-muted-foreground">See how AI understands your business</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base text-muted-foreground">Get actionable recommendations to improve</span>
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
                  placeholder="yourwebsite.com or https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-4">
                <p className="text-xs text-muted-foreground text-center">
                  Note: Results are only available during this session. Enter your email on the results page to save them.
                </p>
                <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Analyzing..."
                  ) : (
                    <>
                      Analyze my website →
                      <ArrowRight className="ml-2 h-5 w-5 hidden" />
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  <strong>3 free tests per week per device</strong> • Takes 3 minutes • No credit card required
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
