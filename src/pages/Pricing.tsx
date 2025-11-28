import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { analytics } from "@/utils/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    contentType: "",
    whyApply: "",
    allowCaseStudy: false,
    commitmentConfirmed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    analytics.pageView('pricing');
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!formData.website.trim()) {
      newErrors.website = "Website URL is required";
    } else {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = "Invalid URL format";
      }
    }
    
    if (!formData.contentType) {
      newErrors.contentType = "Please select a content type";
    }
    
    if (!formData.commitmentConfirmed) {
      newErrors.commitment = "You must confirm your commitment";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-beta-application', {
        body: {
          name: formData.name,
          email: formData.email,
          website: formData.website,
          contentType: formData.contentType,
          whyApply: formData.whyApply,
          allowCaseStudy: formData.allowCaseStudy,
          commitmentConfirmed: formData.commitmentConfirmed,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Submission failed');
      }

      setShowSuccess(true);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowPartnerModal(false);
        setShowSuccess(false);
        // Reset form
        setFormData({
          name: "",
          email: "",
          website: "",
          contentType: "",
          whyApply: "",
          allowCaseStudy: false,
          commitmentConfirmed: false,
        });
        setErrors({});
      }, 3000);

    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      if (error.message?.includes('already exists')) {
        toast({
          title: "Application Already Submitted",
          description: "You've already submitted an application with this email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 text-base px-6 py-2 bg-primary text-primary-foreground">
            🚀 FREE BETA
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Beta Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything is free during our beta period
          </p>
        </div>

        {/* Main Free Beta Card */}
        <div className="max-w-2xl mx-auto mb-24">
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl mb-4">Free Beta Access</CardTitle>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl font-bold text-foreground">$0</span>
                <span className="text-2xl text-muted-foreground line-through">
                  $27-97
                </span>
              </div>
              <p className="text-lg text-muted-foreground mt-4">
                All features unlocked for early testers
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Unlimited FI Score tests</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Both homepage & blog audits</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>All recommendations unlocked</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Code examples & templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Unlimited retests</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>

              <Button
                className="w-full text-lg py-6"
                onClick={() => navigate("/")}
              >
                Start Free Test
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Beta ends: March 2025 | Early testers get lifetime 50% discount
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Beta Partner Section */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              💎 Become a Beta Partner
            </h2>
            <p className="text-lg text-muted-foreground">Limited to 25 people</p>
          </div>

          <Card className="border-2 border-accent shadow-xl bg-gradient-to-br from-background to-accent/5">
            <CardHeader>
              <CardTitle className="text-2xl">Beta Partner Benefits</CardTitle>
              <p className="text-muted-foreground">
                Everything in Free Beta, PLUS:
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>
                    We optimize 1 page for FREE{" "}
                    <span className="text-success font-semibold">
                      ($197 value)
                    </span>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Featured on our Beta Partners page</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>1-on-1 strategy session</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span>Lifetime 50% discount locked in</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="font-semibold mb-3 text-foreground">
                  Requirements:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>→ Provide detailed feedback</p>
                  <p>→ Allow us to showcase before/after</p>
                  <p>→ Actively test for 30 days</p>
                </div>
              </div>

              <Button
                className="w-full text-lg py-6"
                variant="default"
                onClick={() => {
                  console.log("Beta Partner button clicked, opening modal");
                  setShowPartnerModal(true);
                }}
              >
                Apply to be a beta partner
              </Button>

              <div className="text-center">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  18 of 25 spots remaining
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Pricing */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Post-Beta Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Expected launch: March 2025
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="opacity-75 relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-warning text-warning-foreground">
                Beta testers save 50%
              </Badge>
              <CardHeader>
                <CardTitle className="text-xl">Blog Post Audit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$27</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Single blog post analysis</li>
                  <li>✓ AI readability check</li>
                  <li>✓ Content recommendations</li>
                  <li>✓ Code examples</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="opacity-75 relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-warning text-warning-foreground">
                Beta testers save 50%
              </Badge>
              <CardHeader>
                <CardTitle className="text-xl">Homepage Audit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$97</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Full homepage analysis</li>
                  <li>✓ Business clarity check</li>
                  <li>✓ Positioning assessment</li>
                  <li>✓ Implementation guide</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="opacity-75 relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-warning text-warning-foreground">
                Beta testers save 50%
              </Badge>
              <CardHeader>
                <CardTitle className="text-xl">Done-For-You</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">from $197</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ We implement changes</li>
                  <li>✓ Before/after comparison</li>
                  <li>✓ Priority delivery</li>
                  <li>✓ Guaranteed improvement</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                How long is beta free?
              </AccordionTrigger>
              <AccordionContent>
                Until February 2025 or 1000 users, whichever comes first. We'll
                notify all beta testers well in advance before any changes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                What happens after beta?
              </AccordionTrigger>
              <AccordionContent>
                We'll notify you 2 weeks before beta ends. All beta testers
                automatically get a lifetime 50% discount on any paid plan they
                choose.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Can I test multiple URLs?
              </AccordionTrigger>
              <AccordionContent>
                Yes! Up to 10 tests per month during beta to manage costs. Your limit resets automatically 30 days after your first test.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Will my data be deleted after beta?
              </AccordionTrigger>
              <AccordionContent>
                No, you keep all your test history forever. Your account and all
                test results will remain accessible even after beta ends.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              Created by <span className="font-medium">Richa Deo</span> |{" "}
              <a
                href="https://richadeo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link hover:text-link-hover"
              >
                RichaDeo.com →
              </a>
            </div>

            <div className="flex gap-6">
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="/contact"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>

            <div>© 2025 FoundIndex</div>
          </div>
        </div>
      </footer>

      {/* Beta Partner Application Modal */}
      <Dialog open={showPartnerModal} onOpenChange={setShowPartnerModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {showSuccess ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-6xl">✅</div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">
                Application Received!
              </h3>
              <p className="text-muted-foreground">
                We'll respond within 48 hours.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Beta Partner Application</DialogTitle>
                <DialogDescription className="text-base">
                  Join 25 content leaders
                </DialogDescription>
              </DialogHeader>

              {/* What You Get Section */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 my-4">
                <p className="font-semibold text-foreground mb-3">What You Get:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Free page optimization ($197 value)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Featured on our website</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>1-on-1 strategy session</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Lifetime 50% discount</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    placeholder="John Doe"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    placeholder="john@example.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Website URL *
                  </label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => {
                      setFormData({ ...formData, website: e.target.value });
                      setErrors({ ...errors, website: "" });
                    }}
                    placeholder="https://yoursite.com"
                    className={errors.website ? "border-destructive" : ""}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive mt-1">{errors.website}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Content Type *
                  </label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => {
                      setFormData({ ...formData, contentType: value });
                      setErrors({ ...errors, contentType: "" });
                    }}
                  >
                    <SelectTrigger className={errors.contentType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog posts</SelectItem>
                      <SelectItem value="product">Product pages</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="marketing">Marketing content</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.contentType && (
                    <p className="text-sm text-destructive mt-1">{errors.contentType}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Why apply? (optional)
                  </label>
                  <Textarea
                    value={formData.whyApply}
                    onChange={(e) =>
                      setFormData({ ...formData, whyApply: e.target.value })
                    }
                    placeholder="Tell us about your goals and how you plan to use FoundIndex..."
                    rows={3}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="caseStudy"
                      checked={formData.allowCaseStudy}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, allowCaseStudy: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="caseStudy"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to let FoundIndex showcase my before/after results
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="commitment"
                      checked={formData.commitmentConfirmed}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, commitmentConfirmed: checked as boolean });
                        setErrors({ ...errors, commitment: "" });
                      }}
                    />
                    <label
                      htmlFor="commitment"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I commit to testing actively for 30 days *
                    </label>
                  </div>
                  {errors.commitment && (
                    <p className="text-sm text-destructive">{errors.commitment}</p>
                  )}
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    We review applications within 48 hours
                  </p>
                  <div className="text-center">
                    <Badge variant="secondary">18 of 25 spots remaining</Badge>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPartnerModal(false);
                      setErrors({});
                    }}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;