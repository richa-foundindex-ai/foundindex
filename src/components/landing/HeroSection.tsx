import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CoffeeBrewingLoader } from "./CoffeeBrewingLoader";

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const normalizeUrl = (url: string): string => {
    // Trim whitespace
    let normalized = url.trim();
    
    // Remove trailing slash if present (we'll add it back later)
    normalized = normalized.replace(/\/+$/, '');
    
    // If no dots and no slashes, assume it's just a domain name - add .com
    if (!normalized.includes('.') && !normalized.includes('/')) {
      normalized = `${normalized}.com`;
    }
    
    // Add https:// if no protocol
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    
    // Ensure trailing slash
    normalized = `${normalized}/`;
    
    return normalized;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.website) {
      toast({
        title: "Missing information",
        description: "Please enter your website URL",
        variant: "destructive",
      });
      return;
    }

    const websiteUrl = normalizeUrl(formData.website);

    setIsSubmitting(true);

    try {
      const { data: submitData, error: submitError } = await supabase.functions.invoke("submit-test", {
        body: {
          website: websiteUrl,
        },
      });

      if (submitError) throw new Error(submitError.message);
      if (submitData?.error) throw new Error(submitData.error);


      if (submitData?.testId) {
        toast({
          title: "Test started!",
          description: "Analyzing your website...",
        });
        navigate(`/results?testId=${submitData.testId}`);
      }
    } catch (error) {
      console.error("[HeroSection] Submit error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      {isSubmitting && <CoffeeBrewingLoader website={formData.website} />}
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-6">
          <h1 className="text-[4rem] md:text-[5.2rem] font-bold text-foreground leading-tight">
            Most businesses are invisible to AI. Check if yours is.
          </h1>
          <p className="text-editorial-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ChatGPT and Claude answer millions of questions every day. They can only recommend what they clearly understand.
          </p>
          <p className="text-editorial-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-4">
            Get your AI visibility score in 3 minutes. See how AI understands your business and what may be missing.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                See how AI systems understand your business
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                Get specific, actionable recommendations
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                Learn what affects your AI visibility
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                Free analysis, no credit card required
              </span>
            </div>
          </div>
        </div>

        <Card className="max-w-xl mx-auto mt-12 p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-base font-medium">
                Website URL
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="slack.com or https://yourwebsite.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                required
                className="h-12"
              />
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Analyzing..."
                ) : (
                  <>
                    Analyze my website
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Free analysis • Takes 3 minutes • No credit card required
              </p>
            </div>
          </form>
        </Card>
      </div>
    </section>
    </>
  );
};

export default HeroSection;
