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

export const UnlockTestsModal = ({ open, onOpenChange, testId, score, website, recommendations }: UnlockTestsModalProps) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Feedback form state
  const [accuracyRating, setAccuracyRating] = useState("");
  const [accuracyWhy, setAccuracyWhy] = useState("");
  const [firstRecommendation, setFirstRecommendation] = useState("");
  const [improvement, setImprovement] = useState("");
  const [shareAnonymously, setShareAnonymously] = useState(false);
  const [shareWithName, setShareWithName] = useState(false);
  const [userName, setUserName] = useState("");
  const [keepPrivate, setKeepPrivate] = useState(false);
  const [email, setEmail] = useState("");

  const handleShareLinkedIn = () => {
    // Get the first recommendation as the key insight
    const keyInsight = recommendations?.[0] || "AI readability improvements needed";
    
    const shareText = `I tested my website's AI visibility with FoundIndex.
Key insight: ${keyInsight}
Free analysis: foundindex.com
#AIvisibility`;
    
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://foundindex.com')}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
    
    // Also copy text to clipboard for easy pasting
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(
        () => toast.success("Share text copied! Paste it in your LinkedIn post"),
        () => {}
      );
    }
    
    // Unlock tests after sharing
    unlockTests();
    toast.success("Thanks for sharing! Your benefits have been unlocked.");
    // Keep popup open - don't close it
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

    if (!accuracyRating || !firstRecommendation) {
      toast.error("Please answer all required questions");
      return;
    }

    if (shareWithName && !userName.trim()) {
      toast.error("Please enter your name to share feedback with attribution");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("submit-feedback", {
        body: {
          testId,
          score,
          website,
          accuracyRating,
          accuracyWhy,
          firstRecommendation,
          improvement,
          permissionLevel: shareAnonymously ? "anonymous" : shareWithName ? "named" : "private",
          userName: shareWithName ? userName : null,
          email: email.trim(),
        },
      });

      if (error) throw error;

      // Unlock tests after feedback
      unlockTests();
      toast.success("✓ Feedback submitted! Check your email for the detailed rewrite guide.");
      onOpenChange(false);
      setShowFeedback(false);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      toast.error("Couldn't submit feedback. Please try again or email us directly at hello@foundindex.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showFeedback) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Help us improve FoundIndex (2 minutes)</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Unlock: Detailed rewrite guide • 3 free tests • Early v2 access
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitFeedback} className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Was your score accurate?</Label>
              <RadioGroup value={accuracyRating} onValueChange={setAccuracyRating} required>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="too_high" id="too_high" />
                  <Label htmlFor="too_high" className="font-normal cursor-pointer">Too high</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="about_right" id="about_right" />
                  <Label htmlFor="about_right" className="font-normal cursor-pointer">About right</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="too_low" id="too_low" />
                  <Label htmlFor="too_low" className="font-normal cursor-pointer">Too low</Label>
                </div>
              </RadioGroup>
              <Textarea
                placeholder="Why? (optional)"
                value={accuracyWhy}
                onChange={(e) => setAccuracyWhy(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Which recommendation will you implement first?</Label>
              <RadioGroup value={firstRecommendation} onValueChange={setFirstRecommendation} required>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service_descriptions" id="service_descriptions" />
                  <Label htmlFor="service_descriptions" className="font-normal cursor-pointer">Service descriptions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="authority_signals" id="authority_signals" />
                  <Label htmlFor="authority_signals" className="font-normal cursor-pointer">Authority signals</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="content_structure" id="content_structure" />
                  <Label htmlFor="content_structure" className="font-normal cursor-pointer">Content structure</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="improvement" className="text-base font-semibold">What would make this tool more valuable?</Label>
              <Textarea
                id="improvement"
                placeholder="Your suggestions..."
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Permissions</Label>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={shareAnonymously}
                    onCheckedChange={(checked) => {
                      setShareAnonymously(checked as boolean);
                      if (checked) {
                        setShareWithName(false);
                        setKeepPrivate(false);
                      }
                    }}
                  />
                  <Label htmlFor="anonymous" className="font-normal cursor-pointer">
                    You can share my feedback anonymously
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="named"
                      checked={shareWithName}
                      onCheckedChange={(checked) => {
                        setShareWithName(checked as boolean);
                        if (checked) {
                          setShareAnonymously(false);
                          setKeepPrivate(false);
                        }
                      }}
                    />
                    <Label htmlFor="named" className="font-normal cursor-pointer">
                      Use my feedback with my name:
                    </Label>
                  </div>
                  {shareWithName && (
                    <Input
                      placeholder="Your name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="ml-6"
                      required={shareWithName}
                    />
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="private"
                    checked={keepPrivate}
                    onCheckedChange={(checked) => {
                      setKeepPrivate(checked as boolean);
                      if (checked) {
                        setShareAnonymously(false);
                        setShareWithName(false);
                      }
                    }}
                  />
                  <Label htmlFor="private" className="font-normal cursor-pointer">
                    Keep my feedback private
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="email" className="text-base font-semibold">
                Email for your rewrite guide: <span className="text-destructive">*</span>
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
                "Submit feedback"
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
          <DialogDescription>
            Choose how to unlock additional tests and your detailed rewrite guide:
          </DialogDescription>
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
                <li>✓ 20% off consulting</li>
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
