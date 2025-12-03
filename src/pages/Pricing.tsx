import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, Check } from "lucide-react";

export default function Pricing() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    content_type: "",
    why_apply: "",
    allow_case_study: false,
    commitment_confirmed: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      content_type: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    return urlPattern.test(url.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim() || !formData.website.trim() || !formData.content_type) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate URL
      if (!validateUrl(formData.website)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid website URL.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate commitment checkbox
      if (!formData.commitment_confirmed) {
        toast({
          title: "Commitment required",
          description: "Please confirm you'll test actively for 30 days.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Normalize website URL
      let normalizedUrl = formData.website.trim().toLowerCase();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }

      // Insert into beta_applications table - matches schema exactly
      const { error } = await supabase.from("beta_applications").insert({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        website: normalizedUrl,
        content_type: formData.content_type,
        why_apply: formData.why_apply.trim() || null,
        allow_case_study: formData.allow_case_study,
        commitment_confirmed: formData.commitment_confirmed,
        status: "pending",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Application submitted!",
        description: "We'll review your application within 48 hours.",
      });
    } catch (error) {
      console.error("Beta application error:", error);
      toast({
        title: "Failed to submit",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing - FoundIndex</title>
        <meta name="description" content="FoundIndex pricing plans. Free tier available. Score your website's AI visibility today." />
      </Helmet>
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Pricing</h1>
          <p className="text-lg text-muted-foreground">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free beta */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Free beta</CardTitle>
              <CardDescription>Perfect for trying FoundIndex</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>3 blog post tests per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>1 homepage test per week</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Full recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>7-day retest cooldown</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/")}>
                Start free
              </Button>
            </CardContent>
          </Card>

          {/* Beta partner */}
          <Card className="border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Limited spots
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Beta partner benefits</CardTitle>
              <CardDescription>Everything in free beta, plus:</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">Free</span>
                <span className="text-muted-foreground"> (application required)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>We optimize 1 page for you</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Featured on our beta showcase</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>1-on-1 strategy session</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Lifetime 50% discount on paid plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Apply for beta partner</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Beta partner application</DialogTitle>
                    <DialogDescription>Join 25 content leaders</DialogDescription>
                  </DialogHeader>

                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Application submitted!</h3>
                      <p className="text-muted-foreground">
                        We review applications within 48 hours. Check your email for next steps.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          style={{ fontSize: "16px" }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          style={{ fontSize: "16px" }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website URL *</Label>
                        <Input
                          id="website"
                          name="website"
                          type="text"
                          placeholder="yoursite.com"
                          value={formData.website}
                          onChange={handleChange}
                          required
                          style={{ fontSize: "16px" }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content_type">Content type *</Label>
                        <Select value={formData.content_type} onValueChange={handleSelectChange}>
                          <SelectTrigger style={{ fontSize: "16px" }}>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blog">Blog posts</SelectItem>
                            <SelectItem value="product">Product pages</SelectItem>
                            <SelectItem value="landing">Landing pages</SelectItem>
                            <SelectItem value="documentation">Documentation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="why_apply">Why apply? (optional)</Label>
                        <Textarea
                          id="why_apply"
                          name="why_apply"
                          placeholder="Tell us about your content goals..."
                          value={formData.why_apply}
                          onChange={handleChange}
                          rows={3}
                          style={{ fontSize: "16px" }}
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="allow_case_study"
                            checked={formData.allow_case_study}
                            onCheckedChange={(checked) => handleCheckboxChange("allow_case_study", checked as boolean)}
                          />
                          <Label htmlFor="allow_case_study" className="text-sm leading-snug cursor-pointer">
                            I agree to let FoundIndex showcase my before/after results
                          </Label>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="commitment_confirmed"
                            checked={formData.commitment_confirmed}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("commitment_confirmed", checked as boolean)
                            }
                          />
                          <Label htmlFor="commitment_confirmed" className="text-sm leading-snug cursor-pointer">
                            I commit to testing actively for 30 days *
                          </Label>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground text-center">
                        We review applications within 48 hours
                      </p>

                      <div className="text-center">
                        <span className="inline-block bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                          18 of 25 spots remaining
                        </span>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit application"
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>→ Provide detailed feedback</li>
                  <li>→ Allow us to showcase results</li>
                  <li>→ Actively test for 30 days</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Post-beta pricing */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Post-beta pricing</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            After beta, pricing will start at $29/month for unlimited tests. Beta partners get 50% off for life.
          </p>
        </div>
      </main>
    </div>
  );
}
