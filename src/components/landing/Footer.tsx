import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      toast.success("Thanks! We'll notify you when v2 launches 🚀");
      setEmail("");
    } catch (err) {
      console.error("Failed to save waitlist email:", err);
      toast.error("Failed to save your email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="py-16 px-4 bg-accent-gray-light border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold">Join the v2 waitlist</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Be the first to access multi-page analysis, competitor tracking, and citation monitoring.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
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

          <div className="pt-8 space-y-3 text-sm text-muted-foreground">
            <p>
              Built by @[your-linkedin-handle] — UX researcher at British Telecom (independent project)
            </p>
            <p>
              Uses OpenAI models for analysis • We don't store your website data
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
