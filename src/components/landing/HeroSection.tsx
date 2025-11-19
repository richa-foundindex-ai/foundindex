import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    industry: "",
    email: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.industry || !formData.email || !formData.website) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-test', {
        body: {
          email: formData.email,
          website: formData.website,
          industry: formData.industry,
        }
      });

      if (error) throw error;

      toast({
        title: "Test Started!",
        description: "Testing your website across AI engines. Results in 90 seconds...",
      });

      // Navigate to results page with test ID
      setTimeout(() => {
        navigate(`/results?testId=${data.testId}`);
      }, 1500);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Headline */}
        <h1 className="text-editorial-xl text-center mb-6">
          Are You Found When It Matters?
        </h1>

        {/* Subheadline */}
        <p className="text-body-lg text-secondary text-center max-w-3xl mx-auto mb-12">
          81% of buyers ask ChatGPT, Claude, and Perplexity for recommendations
          instead of Google. If AI doesn't know you exist, you're invisible to
          buyers ready to purchase.
        </p>

        {/* Key Stat Box */}
        <Card className="max-w-3xl mx-auto mb-12 p-8 border-2 border-primary bg-accent-red-light">
          <p className="text-2xl font-bold text-center mb-2">
            AI-Driven Buyers Convert at 14.2% vs. 2.8% Google Organic
          </p>
          <p className="text-lg text-center text-secondary">
            Being found by AI = access to 5x higher-converting traffic
          </p>
        </Card>

        {/* What is FoundIndex */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-xl font-bold mb-4">What is FoundIndex?</h2>
          <p className="text-body-lg text-muted-foreground">
            FoundIndex is the first standardized AI visibility benchmark. Your
            score (0-100) measures how often AI engines recommend your brand
            when buyers ask for solutions—calibrated against our database of
            200+ tested companies.
          </p>
        </div>

        {/* Form Card */}
        <Card className="max-w-xl mx-auto p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-6">
            Calculate Your FoundIndex Score
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) =>
                  setFormData({ ...formData, industry: value })
                }
              >
                <SelectTrigger id="industry" className="w-full">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="saas">SaaS/Technology</SelectItem>
                  <SelectItem value="financial">Financial Services</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="professional">
                    Professional Services
                  </SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL *</Label>
              <Input
                id="website"
                type="url"
                placeholder="yourcompany.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground text-lg py-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Testing Your Website...
                </>
              ) : (
                <>
                  Calculate My FoundIndex
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Free beta • 3 tests/month • Results in 90 sec • No credit card
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default HeroSection;
