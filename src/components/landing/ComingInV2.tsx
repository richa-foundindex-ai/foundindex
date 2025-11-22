import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ComingInV2 = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const features = [
    "Multi-page analysis (homepage + 5 key pages)",
    "Competitor comparison",
    "Citation tracking",
    "Industry benchmarks",
    "Monthly monitoring",
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
      const { error } = await supabase
        .from('test_submissions')
        .insert({
          test_id: `v2-waitlist-${Date.now()}`,
          email: email.trim(),
        });

      if (error) throw error;

      toast.success("✓ You're on the v2 waitlist! We'll email you when it launches.");
      setEmail("");
    } catch (err) {
      console.error("Failed to save waitlist email:", err);
      toast.error("Couldn't save email. Please try again or email us directly at hello@foundindex.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">
          What's coming next
        </h2>

        <Card className="p-8 bg-accent-gray-light border-none">
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're building v2 based on your feedback:
            </p>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">→</span>
                  <span className="text-lg text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <p className="text-lg font-medium text-foreground mb-4">
                Join the v2 waitlist:
              </p>
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
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ComingInV2;
