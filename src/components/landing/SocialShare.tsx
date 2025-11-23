import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ComingInV2 = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);

  const features = [
    "Multi-page analysis (homepage + 5 key pages)",
    "Competitor comparison",
    "Citation tracking",
    "Industry benchmarks",
    "Monthly monitoring",
  ];

  const linkedInShareText = `I joined the FoundIndex v2 waitlist for multi-page AI visibility analysis.

Free v1 homepage test: foundindex.com

#AIvisibility`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🚀 Submitting waitlist email:", email.trim());

      const { data, error } = await supabase.functions.invoke("submit-waitlist", {
        body: {
          email: email.trim(),
          source: "v2_waitlist",
        },
      });

      console.log("Response:", { data, error });

      setEmail("");
      setShowSuccess(true);
      toast.success("Thanks! We'll notify you when v2 launches.");
    } catch (err) {
      console.error("Error:", err);
      setEmail("");
      setShowSuccess(true);
      toast.success("Thanks! We'll notify you when v2 launches.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkedInShare = async () => {
    try {
      // Copy text to clipboard
      await navigator.clipboard.writeText(linkedInShareText);

      // Open LinkedIn
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://foundindex.com")}`;
      window.open(linkedInUrl, "_blank", "width=600,height=600");

      // Show modal
      setShowLinkedInModal(true);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  return (
    <>
      <section className="py-20 px-4 bg-background" data-waitlist-section>
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-editorial-lg text-center mb-8">What's coming next</h2>

          <Card className="p-8 bg-accent-gray-light border-none">
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">We're building v2 based on your feedback:</p>

              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">→</span>
                    <span className="text-lg text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6">
                <p className="text-lg font-medium text-foreground mb-4">Join the v2 waitlist:</p>
                {!showSuccess ? (
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Notify me"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg text-foreground">Thanks! We'll notify you when v2 launches.</p>
                    <Button onClick={handleLinkedInShare} className="w-full">
                      Share on LinkedIn
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Dialog open={showLinkedInModal} onOpenChange={setShowLinkedInModal}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="p-8">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-bold text-center">📋 Text copied to clipboard</DialogTitle>
              <DialogDescription className="text-lg text-center">Paste this into your LinkedIn post:</DialogDescription>
            </DialogHeader>

            <div className="my-8">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                <p className="text-[17px] leading-relaxed whitespace-pre-line text-gray-900">{linkedInShareText}</p>
              </div>
            </div>

            <Button onClick={() => setShowLinkedInModal(false)} className="w-full text-lg py-6" size="lg">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComingInV2;
