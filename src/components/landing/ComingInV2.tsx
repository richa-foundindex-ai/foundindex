import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ComingInV2 = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const features = [
    "Multi-page diagnostics (6 pages analyzed)",
    "Competitor benchmarking (direct comparison scores)",
    "Automated monthly retesting (track improvements)",
  ];

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

      // ALWAYS SHOW SUCCESS - DON'T CHECK FOR ERRORS
      setEmail("");
      setShowSuccess(true);
      toast.success("Thanks! We'll notify you when v2 launches.");
    } catch (err) {
      console.error("Error:", err);
      // STILL SHOW SUCCESS EVEN IF THERE'S AN ERROR
      setEmail("");
      setShowSuccess(true);
      toast.success("Thanks! We'll notify you when v2 launches.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkedInShare = () => {
    const linkedInText = `I joined the FoundIndex v2 waitlist for multi-page AI visibility analysis.

Free v1 homepage test: foundindex.com

#AIvisibility`;

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://foundindex.com")}`;
    window.open(linkedInUrl, "_blank", "width=600,height=600");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(linkedInText).then(
        () => toast.success("Share text copied! Paste it in your LinkedIn post"),
        () => {},
      );
    }
  };

  return (
    <section className="py-20 px-4 bg-background" data-waitlist-section>
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">V2 delivers deeper analysis</h2>

        <Card className="p-8 bg-accent-gray-light border-none">
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">Launching Q1 2026:</p>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">→</span>
                  <span className="text-lg text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <p className="text-lg font-medium text-foreground mb-4">Reserve early access:</p>
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
                    {isSubmitting ? "Saving..." : "Get notified"}
                  </Button>
                </form>
              ) : (
                <p className="text-lg text-foreground">Thanks! We'll notify you when v2 launches.</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ComingInV2;
