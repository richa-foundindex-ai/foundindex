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
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CoffeeBrewingLoader } from "./CoffeeBrewingLoader";

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

    // Create timeout promise (180 seconds = 3 minutes)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 3 minutes")), 180000);
    });

    try {
      const submissionPromise = supabase.functions.invoke('submit-test', {
        body: {
          email: formData.email,
          website: formData.website,
          industry: formData.industry,
        }
      });

      // Race between submission and timeout
      const { data, error } = await Promise.race([
        submissionPromise,
        timeoutPromise
      ]) as { data: any; error: any };

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || "Failed to send request to Edge Function");
      }

      if (!data || !data.testId) {
        console.error('Invalid response from edge function:', data);
        throw new Error("Invalid response from server");
      }

      // Navigate to results page with test ID
      navigate(`/results?testId=${data.testId}`);

    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      
      let errorMessage = "Please try again";
      let errorTitle = "Submission failed";
      
      if (error instanceof Error) {
        if (error.message.includes("timed out")) {
          errorTitle = "Request timed out";
          errorMessage = "The test took longer than 3 minutes. This may indicate an issue with the testing service. Please try again in a few minutes.";
        } else if (error.message.includes("Failed to send request")) {
          errorTitle = "Connection failed";
          errorMessage = "Unable to connect to the testing service. Please check your internet connection and try again.";
        } else if (error.message.includes("rate limit")) {
          errorTitle = "Rate limit exceeded";
          errorMessage = error.message;
        } else if (error.message.includes("AUTHENTICATION")) {
          errorTitle = "Authentication error";
          errorMessage = "There was an authentication issue. Please try again or contact support if the problem persists.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {isSubmitting && <CoffeeBrewingLoader />}
      
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
              Calculate My FoundIndex
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Free beta • 3 tests/month • Results in 2-3 min • Currently testing ChatGPT only (Claude & Perplexity coming soon) • No credit card
            </p>
          </form>
        </Card>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
