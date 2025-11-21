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
import { ArrowRight, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CoffeeBrewingLoader } from "./CoffeeBrewingLoader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    industry: "",
    email: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMismatchDialog, setShowMismatchDialog] = useState(false);
  const [mismatchInfo, setMismatchInfo] = useState<{
    detectedType: string;
    chosenIndustry: string;
    exampleQueries: string[];
  } | null>(null);

  const industryOptions = [
    { value: "Software & Apps", label: "Software & Apps" },
    { value: "Online Retail & Shopping", label: "Online Retail & Shopping" },
    { value: "Health & Medical Services", label: "Health & Medical Services" },
    { value: "Finance & Accounting", label: "Finance & Accounting" },
    { value: "Business Services (Consulting, Legal, etc.)", label: "Business Services (Consulting, Legal, etc.)" },
    { value: "Other", label: "Other" },
  ];

  const mapIndustryToAirtable = (displayValue: string): string => {
    const mapping: Record<string, string> = {
      'Software & Apps': 'saas',
      'Finance & Accounting': 'financial',
      'Online Retail & Shopping': 'ecommerce',
      'Business Services (Consulting, Legal, etc.)': 'professional',
      'Health & Medical Services': 'healthcare',
      'Beauty & Cosmetics': 'beauty',
      'Education & Training': 'education',
      'Legal Services': 'legal',
      'Telecom & Communications': 'telecom',
      'Food & Beverage': 'food',
      'Real Estate': 'realestate',
      'Consulting': 'consulting',
      'Marketing & Advertising': 'marketing',
      'Travel & Tourism': 'travel',
      'Manufacturing': 'manufacturing',
      'Other': 'other',
    };
    return mapping[displayValue] || displayValue.toLowerCase();
  };

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

  const getExampleQueries = (industry: string): string[] => {
    const queries: Record<string, string[]> = {
      'Software & Apps': [
        'What are the best project management tools for remote teams?',
        'Which CRM software is best for small businesses?'
      ],
      'Online Retail & Shopping': [
        'Where can I buy organic coffee beans online?',
        'Best online stores for sustainable fashion?'
      ],
      'Health & Medical Services': [
        'What are the best telemedicine platforms?',
        'Which health tracking apps are most accurate?'
      ],
      'Finance & Accounting': [
        'What are the best investment platforms for beginners?',
        'Which banks offer the best business checking accounts?'
      ],
      'Business Services (Consulting, Legal, etc.)': [
        'How to find a good business consultant?',
        'Best accounting firms for small businesses?'
      ],
      'Beauty & Cosmetics': [
        'What are the best organic skincare brands?',
        'Where to buy cruelty-free makeup products?'
      ],
      'Education & Training': [
        'What are the best online course platforms?',
        'Which certification programs are worth it?'
      ],
      'Legal Services': [
        'How to find a business attorney?',
        'Best law firms for startups?'
      ],
      'Telecom & Communications': [
        'What are the best business phone systems?',
        'Which internet service providers offer the best speeds?'
      ],
      'Food & Beverage': [
        'Where to order fresh meal kits online?',
        'Best organic food delivery services?'
      ],
      'Real Estate': [
        'How to find a good real estate agent?',
        'Best property management companies?'
      ],
      'Consulting': [
        'Top management consulting firms for small businesses?',
        'How to hire a strategy consultant?'
      ],
      'Marketing & Advertising': [
        'Best digital marketing agencies for startups?',
        'Which social media management tools are worth it?'
      ],
      'Travel & Tourism': [
        'Best travel booking websites for vacation packages?',
        'Which travel insurance companies are most reliable?'
      ],
      'Manufacturing': [
        'Best suppliers for [specific product]?',
        'Which manufacturing software helps with inventory management?'
      ],
      'Other': [
        'Best [category] for [use case]?',
        '[Company A] vs [Company B] comparison?'
      ]
    };
    return queries[industry] || queries['Other'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.industry || !formData.email || !formData.website) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const websiteUrl = normalizeUrl(formData.website);

    setIsSubmitting(true);

    try {
      const mappedIndustry = mapIndustryToAirtable(formData.industry);
      const { data: submitData, error: submitError } = await supabase.functions.invoke("submit-test", {
        body: {
          email: formData.email,
          website: websiteUrl,
          industry: mappedIndustry,
        },
      });

      if (submitError) throw new Error(submitError.message);
      if (submitData?.error) throw new Error(submitData.error);

      if (submitData?.mismatch) {
        setMismatchInfo({
          detectedType: submitData.detectedType,
          chosenIndustry: formData.industry,
          exampleQueries: getExampleQueries(formData.industry),
        });
        setShowMismatchDialog(true);
        setIsSubmitting(false);
        return;
      }

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

  const handleContinueAnyway = async () => {
    setShowMismatchDialog(false);
    setIsSubmitting(true);

    try {
      const websiteUrl = normalizeUrl(formData.website);

      const mappedIndustry = mapIndustryToAirtable(formData.industry);
      const { data, error } = await supabase.functions.invoke("submit-test", {
        body: {
          email: formData.email,
          website: websiteUrl,
          industry: mappedIndustry,
          skipMismatchCheck: true,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (data?.testId) {
        toast({
          title: "Test started!",
          description: "Analyzing your website...",
        });
        navigate(`/results?testId=${data.testId}`);
      }
    } catch (error) {
      console.error("[HeroSection] Continue anyway error:", error);
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
      <AlertDialog open={showMismatchDialog} onOpenChange={setShowMismatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Industry mismatch detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-3">
              <p>
                Your website appears to be <strong>{mismatchInfo?.detectedType}</strong> but you selected{' '}
                <strong>{mismatchInfo?.chosenIndustry}</strong>.
              </p>
              <p>
                This may result in a low score because we'll test with questions like:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {mismatchInfo?.exampleQueries.map((query, i) => (
                  <li key={i}>{query}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, let me change</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueAnyway}>
              Continue anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isSubmitting && <CoffeeBrewingLoader />}
      
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-6">
          <h1 className="text-display font-bold text-foreground leading-tight">
            Is your website ready for AI search?
          </h1>
          <p className="text-editorial-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get your AI-readiness score in 3 minutes. See exactly what to improve.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-base text-muted-foreground">
                Analyze how AI-friendly your website is
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
                Understand how ChatGPT and Claude "read" your business
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-base font-medium">
                  Industry
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    setFormData({ ...formData, industry: value })
                  }
                >
                  <SelectTrigger id="industry" className="h-12">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {industryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-base font-medium">
                  Website URL
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  required
                  className="h-12"
                />
              </div>
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
