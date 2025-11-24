import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, CheckCircle2 } from "lucide-react";

interface UnlockTestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: "after-test" | "after-feedback" | "waitlist" | "general";
  score?: number;
  topRecommendation?: string;
}

const UnlockTestsModal = ({ open, onOpenChange, scenario, score, topRecommendation }: UnlockTestsModalProps) => {
  const [copied, setCopied] = useState(false);

  const getLinkedInCopy = () => {
    switch (scenario) {
      case "after-test":
        return `I just ran my website through FoundIndex — a tool that scores how clearly AI systems understand your business.

My AI Visibility Score: ${score || "[score]"}/100  
Key insight: ${topRecommendation || "[top recommendation]"}

As more people ask ChatGPT and Claude for recommendations instead of Googling, this kind of visibility is becoming critical. The analysis took 3 minutes and revealed gaps I didn't know existed.

If you want to see how AI interprets your site, try it:
foundindex.com (created by Richa Deo)

#FoundIndex #AIVisibility #FutureOfSearch`;

      case "after-feedback":
        return `Just shared feedback on FoundIndex — a tool that analyzes how clearly AI models like ChatGPT understand your business.

If you work in marketing, SEO, content, or run a business website, it's worth a look. It highlights where AI gets confused or misses key details about your offering.

Free test: foundindex.com (created by Richa Deo)

#FoundIndex #AIVisibility #FutureOfSearch`;

      case "waitlist":
        return `I joined the FoundIndex v2 waitlist — the next version of the tool that analyzes how clearly AI understands your business.

v1 gives a free homepage diagnostic.  
v2 adds:
→ Multi-page analysis  
→ Competitor comparison  
→ Monthly tracking  
→ Industry benchmarks  

As AI-led discovery grows, understanding how AI describes your business is becoming essential.

Join the waitlist: foundindex.com (created by Richa Deo)

#FoundIndex #AIVisibility #FutureOfSEO`;

      case "general":
      default:
        return `Came across a tool that measures how clearly AI systems like ChatGPT understand your business — it's called FoundIndex.

It runs a free 3-minute analysis and shows where AI gets confused about your offering. With search shifting toward AI recommendations, this is worth trying.

foundindex.com (created by Richa Deo)

#FoundIndex #AIVisibility #FutureOfSearch`;
    }
  };

  const handleShare = async () => {
    const textToCopy = getLinkedInCopy();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      // Reset the "testsRemaining" in localStorage to unlock 3 more tests
      localStorage.setItem("testsRemaining", "3");

      // Store that they shared on this date
      localStorage.setItem("linkedInSharedDate", new Date().toISOString());

      setTimeout(() => {
        setCopied(false);
        onOpenChange(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!copied ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Share on LinkedIn to unlock 3 more tests
              </DialogTitle>
              <DialogDescription>
                We'll copy a pre-written post to your clipboard. Just paste it on LinkedIn.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-sm max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-xs">{getLinkedInCopy()}</pre>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleShare} className="w-full">
                  Copy & Open LinkedIn
                </Button>
                <p className="text-xs text-muted-foreground text-center">After posting, you'll get 3 more free tests</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-success animate-in zoom-in" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">LinkedIn post copied!</h3>
              <p className="text-sm text-muted-foreground">
                Now paste it on LinkedIn. You've unlocked 3 more tests. 🎉
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UnlockTestsModal;
