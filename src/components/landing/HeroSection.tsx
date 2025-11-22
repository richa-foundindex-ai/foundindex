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
  const [rateLimitInfo, setRateLimitInfo] = useState<{ url: string; score: number; remainingTests: number } | null>(null);


  const normalizeUrl = (url: string): string => {
    // Trim whitespace
    let normalized = url.trim();
    
    // Remove trailing slash if present (we'll add it back later)
    normalized = normalized.replace(/\/+$/, '');
    
    // If no dots and no slashes, assume it's just a domain name - add .com
    if (!normalized.includes('.') && !normalized.includes('/')) {
      normalized = `${normalized}.com`;
    }
    
    // Add https:// if no protocol
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    
    // Ensure trailing slash
    normalized = `${normalized}/`;
    
    return normalized;
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

    // Check rate limit before submitting
    const rateLimit = checkRateLimit(websiteUrl);
    
    if (!rateLimit.allowed) {
      if (rateLimit.previousScore !== undefined) {
        // Show modal for previously tested URL
        setRateLimitInfo({
          url: websiteUrl,
          score: rateLimit.previousScore,
          remainingTests: rateLimit.remainingTests
        });
        setShowRateLimitModal(true);
        return;
      } else {
        toast({
          title: "Monthly limit reached",
          description: "Share on LinkedIn or give feedback to unlock more tests!",
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
        recordTest(websiteUrl, submitData.score || 0);
        
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
              <p className="font-medium">Want to test more sites?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowRateLimitModal(false);
                // Navigate to results page or show unlock modal
                const unlockModal = document.querySelector('[data-unlock-modal]');
                if (unlockModal) {
                  (unlockModal as HTMLElement).click();
                }
              }}
            >
              Share on LinkedIn
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                setShowRateLimitModal(false);
                // Show feedback modal
                const feedbackModal = document.querySelector('[data-feedback-modal]');
                if (feedbackModal) {
                  (feedbackModal as HTMLElement).click();
                }
              }}
            >
              Give feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-6">
          <h1 className="text-[2.56rem] md:text-[3.33rem] font-bold text-foreground leading-tight">
            Most businesses are invisible to AI. Check if yours is.
          </h1>
          <p className="text-editorial-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ChatGPT and Claude answer millions of questions every day. They can only recommend what they clearly understand.
          </p>
          <p className="text-editorial-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-4">
            Get your AI visibility score in 3 minutes. See how AI understands your business and what may be missing.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                See how AI systems understand your business
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                Get specific, actionable recommendations
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                Learn what affects your AI visibility
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                Free analysis, no credit card required
              </span>
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
                type="url"
                placeholder="slack.com or https://yourwebsite.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                required
                className="h-12"
              />
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg"
                disabled={isSubmitting}
              >
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
                Free analysis • Takes 3 minutes • No credit card required
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
