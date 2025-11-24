import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, X, CheckCircle2, Share2, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { unlockTests } from "@/utils/rateLimiting";

interface UnlockTestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string;
  score: number;
  website: string;
  recommendations?: string[];
}

export const UnlockTestsModal = ({
  open,
  onOpenChange,
  testId,
  score,
  website,
  recommendations,
}: UnlockTestsModalProps) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLinkedInSuccess, setShowLinkedInSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback form state
  const [surprisingResult, setSurprisingResult] = useState("");
  const [describeToColleague, setDescribeToColleague] = useState("");
  const [preventingImprovements, setPreventingImprovements] = useState<string[]>([]);
  const [otherPrevention, setOtherPrevention] = useState("");
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");

  const preventionOptions = [
    "I don't know which pages to fix first",
    "I don't know how to rewrite my content",
    "I can't tell if my changes actually helped",
    "I need to compare my site to competitors",
    "I don't have time to do this myself",
    "I need expert help",
  ];

  const handleShareLinkedIn = () => {
    const topRec = recommendations?.[0] || "Implement Schema.org markup for products to enhance search visibility.";

    const text = `I just ran my website through FoundIndex — a tool that scores how clearly AI systems understand your business.

My AI Visibility Score: ${score}/100  
Key insight: ${topRec}

As more people ask ChatGPT and Claude for recommendations instead of Googling, this kind of visibility is becoming critical. The analysis took 3 minutes and revealed gaps I didn't know existed.

If you want to see how AI interprets your site, try it:
foundindex.com (created by Richa Deo)

#FoundIndex #AIVisibility #FutureOfSearch`;

    // Copy to clipboard
    navigator.clipboard.writeText(text);

    // Show success modal
    setShowLinkedInSuccess(true);

    // Unlock tests
    unlockTests();

    // Open LinkedIn in new tab
    window.open("https://www.linkedin.com/feed/", "_blank");

    // Auto-close after 10 seconds
    setTimeout(() => {
      setShowLinkedInSuccess(false);
      onOpenChange(false);
    }, 10000);
  };

  const handleGiveFeedback = () => {
    setShowFeedback(true);
  };

  const handleDoBoth = () => {
    setShowFeedback(true);
    toast.info("After submitting feedback, remember to share on LinkedIn to unlock all benefits!");
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email to receive the rewrite guide");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!surprisingResult.trim() || !describeToColleague.trim() || !userType) {
      toast.error("Please answer all required questions");
      return;
    }

    if (preventingImprovements.includes("Something else") && !otherPrevention.trim()) {
      toast.error("Please specify what else is preventing you from improving");
      return;
    }

    const previousEmail = localStorage.getItem("feedbackSubmittedEmail");
    const previousDate = localStorage.getItem("feedbackSubmittedDate");

    if (previousEmail && previousDate) {
      const submittedTime = parseInt(previousDate);
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      if (email.trim().toLowerCase() === previousEmail.toLowerCase() && submittedTime > thirtyDaysAgo) {
        toast.error("You've already submitted feedback this month. For more tests, email hello@foundindex.com");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("submit-feedback", {
        body: {
          testId,
          score,
          website,
          surprisingResult: surprisingResult.trim(),
          describeToColleague: describeToColleague.trim(),
          preventingImprovements:
            preventingImprovements.join(", ") +
            (preventingImprovements.includes("Something else") ? `: ${otherPrevention}` : ""),
          userType,
          email: email.trim(),
        },
      });

      if (error) throw error;

      localStorage.setItem("testsRemaining", "3");
      localStorage.setItem("feedbackSubmittedEmail", email.trim().toLowerCase());
      localStorage.setItem("feedbackSubmittedDate", Date.now().toString());

      unlockTests();
      setShowFeedback(false);
      setShowConfirmation(true);

      toast.success("Thanks for your feedback! You've unlocked 3 more tests. 🎉", {
        duration: 5000,
        style: {
          fontSize: "16px",
          padding: "20px",
        },
      });
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      toast.error("Couldn't submit feedback. Please try again or email us at hello@foundindex.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  // LinkedIn success modal
  if (showLinkedInSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-success animate-in zoom-in" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">LinkedIn post copied!</h3>
              <p className="text-sm text-muted-foreground">
                Paste it on LinkedIn to share your score. You've unlocked 3 more tests. 🎉
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showConfirmation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              Thanks! Your rewrite guide is on its way.
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              You'll receive your personalized homepage rewrite guide within 24-48 hours during beta.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Back to results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showFeedback) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Help us improve FoundIndex (60 seconds)</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Detailed homepage rewrite guide</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">3 additional free tests</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Early v2 access</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitFeedback} className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="surprising" className="text-base font-semibold">
                What surprised you most about your results? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="surprising"
                placeholder="I didn't realize my homepage was vague"
                value={surprisingResult}
                onChange={(e) => setSurprisingResult(e.target.value)}
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">{surprisingResult.length}/100 characters</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="describe" className="text-base font-semibold">
                How would you describe FoundIndex to a colleague? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="describe"
                placeholder="It's a tool that..."
                value={describeToColleague}
                onChange={(e) => setDescribeToColleague(e.target.value)}
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">{describeToColleague.length}/100 characters</p>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                What's preventing you from improving your AI visibility right now?{" "}
                <span className="text-muted-foreground">(select all that apply)</span>
              </Label>
              <div className="space-y-3">
                {preventionOptions.map((option) => (
                  <div key={option} className="flex items-start space-x-2">
                    <Checkbox
                      id={option}
                      checked={preventingImprovements.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPreventingImprovements([...preventingImprovements, option]);
                        } else {
                          setPreventingImprovements(preventingImprovements.filter((p) => p !== option));
                        }
                      }}
                    />
                    <Label htmlFor={option} className="font-normal cursor-pointer leading-tight">
                      {option}
                    </Label>
                  </div>
                ))}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="other"
                      checked={preventingImprovements.includes("Something else")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPreventingImprovements([...preventingImprovements, "Something else"]);
                        } else {
                          setPreventingImprovements(preventingImprovements.filter((p) => p !== "Something else"));
                          setOtherPrevention("");
                        }
                      }}
                    />
                    <Label htmlFor="other" className="font-normal cursor-pointer leading-tight">
                      Something else:
                    </Label>
                  </div>
                  {preventingImprovements.includes("Something else") && (
                    <Input
                      placeholder="Please specify..."
                      value={otherPrevention}
                      onChange={(e) => setOtherPrevention(e.target.value)}
                      className="ml-6"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Which best describes you? <span className="text-destructive">*</span>
              </Label>
              <RadioGroup value={userType} onValueChange={setUserType} required>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="agency" id="agency" />
                  <Label htmlFor="agency" className="font-normal cursor-pointer">
                    Agency/consultant working with multiple clients
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inhouse" id="inhouse" />
                  <Label htmlFor="inhouse" className="font-normal cursor-pointer">
                    In-house marketer/founder managing our site
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seo" id="seo" />
                  <Label htmlFor="seo" className="font-normal cursor-pointer">
                    SEO professional adding this to my services
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exploring" id="exploring" />
                  <Label htmlFor="exploring" className="font-normal cursor-pointer">
                    Just exploring to learn more
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="email" className="text-base font-semibold">
                Email to receive your rewrite guide: <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit & unlock bonuses"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl">Want to test more sites?</DialogTitle>
          <DialogDescription>Choose how to unlock additional tests and your detailed rewrite guide:</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3 pt-4">
          <Card className="p-5 space-y-4 hover:border-primary transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Share2 className="h-5 w-5" />
                <h3 className="font-semibold">Share on LinkedIn</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ 3 additional tests this month</li>
                <li>✓ Detailed homepage rewrite guide</li>
                <li>✓ Early v2 access</li>
              </ul>
            </div>
            <Button className="w-full" variant="outline" onClick={handleShareLinkedIn}>
              Share on LinkedIn
            </Button>
          </Card>

          <Card className="p-5 space-y-4 hover:border-primary transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-semibold">Give feedback</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ 3 additional tests this month</li>
                <li>✓ Detailed homepage rewrite guide</li>
                <li>✓ Early v2 access</li>
              </ul>
            </div>
            <Button className="w-full" variant="outline" onClick={handleGiveFeedback}>
              Submit feedback
            </Button>
          </Card>

          <Card className="p-5 space-y-4 border-primary bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">Do both</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Unlimited tests for 30 days</li>
                <li>✓ Detailed rewrite guide</li>
                <li>✓ Priority v2 beta access</li>
              </ul>
            </div>
            <Button className="w-full" onClick={handleDoBoth}>
              I'll do both
            </Button>
          </Card>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
