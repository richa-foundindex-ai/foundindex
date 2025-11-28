import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, Copy, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { analytics } from "@/utils/analytics";

export const ContactForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    analytics.pageView('contact');
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("hello@foundindex.com");
    toast.success("Email copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    analytics.formSubmit('contact_form');

    try {
      const { error } = await supabase.functions.invoke("submit-contact", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject,
          message: formData.message.trim(),
        },
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Message sent successfully!");
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      analytics.error('contact_form_error', error.message);
      toast.error("Failed to send message. Please try again or use the email button below.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-scale-in" />
        <h2 className="text-2xl font-bold">Message Sent!</h2>
        <p className="text-muted-foreground">
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to home...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Mail className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-muted-foreground">
            Questions? Feedback? We'd love to hear from you.
          </p>
          
          <div className="flex items-center justify-center gap-6 pt-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">hello@foundindex.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Response: Within 24 hours</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => setFormData({ ...formData, subject: value })}
              disabled={isSubmitting}
              required
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General question</SelectItem>
                <SelectItem value="technical">Technical issue</SelectItem>
                <SelectItem value="beta">Beta partnership</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us what's on your mind..."
              rows={6}
              disabled={isSubmitting}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full min-h-[48px]" 
            disabled={isSubmitting}
            aria-label="Send message"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </form>

        <div className="pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground mb-2">Direct email:</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyEmail}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            hello@foundindex.com
          </Button>
        </div>
      </div>
    </div>
  );
};
