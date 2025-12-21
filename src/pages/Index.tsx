import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import SEOSchema from "@/components/SEOSchema";
import Footer from "@/components/landing/Footer";
import { analytics } from "@/utils/analytics";
import { validateAndNormalizeUrl, getErrorMessage } from "@/utils/urlValidation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBlogTestCounter } from "@/hooks/useBlogTestCounter";
import { RateLimitBanner } from "@/components/landing/RateLimitBanner";
import { isStructuredError } from "@/utils/errorTypes";
import { ToastAction } from "@/components/ui/toast";
import { RetestModal } from "@/components/RetestModal";

// New landing page components
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorksNew from "@/components/landing/HowItWorksNew";
import ResultsStats from "@/components/landing/ResultsStats";
import WhoShouldUse from "@/components/landing/WhoShouldUse";
import FAQNew from "@/components/landing/FAQNew";
import FinalCTANew from "@/components/landing/FinalCTANew";
import TestSection from "@/components/landing/TestSection";

interface RetestModalData {
  url: string;
  lastTestedDate: Date;
  nextAvailableDate: Date;
  cachedTestId: string;
  cachedScore: number;
  attemptsExhausted?: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast, dismiss } = useToast();
  const { incrementBlogTestCount } = useBlogTestCounter();

  const [homepageUrl, setHomepageUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [isLoadingHomepage, setIsLoadingHomepage] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);
  const [homepageError, setHomepageError] = useState<string | null>(null);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [homepageSuggestion, setHomepageSuggestion] = useState<string | null>(null);
  const [blogSuggestion, setBlogSuggestion] = useState<string | null>(null);

  const [retestModalOpen, setRetestModalOpen] = useState(false);
  const [retestModalData, setRetestModalData] = useState<RetestModalData | null>(null);

  useEffect(() => {
    analytics.pageView("homepage");
  }, []);

  const scrollToTestSection = () => {
    document.getElementById("test-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const normalizeRateLimitPayload = (p: any) => {
    if (!p) return null;
    return {
      testId: p.test_id || p.cached_test_id || p.testId || p.cachedTestId || "",
      testedAt: p.testedAt || p.cached_created_at || p.cached_created_at_iso || p.tested_at || p.created_at || null,
      canRetestAt: p.canRetestAt || p.can_retest_at || p.next_available_time || p.nextAvailable || p.canRetest || null,
      cachedScore:
        typeof p.cached_score === "number"
          ? p.cached_score
          : typeof p.cachedScore === "number"
            ? p.cachedScore
            : undefined,
      attemptsExhausted: p.attempts_exhausted === true || (typeof p.attempts === "number" && p.attempts >= 3) || false,
      userMessage: p.user_message || p.userMessage || p.message || null,
    };
  };

  const handleAnalysisError = (errorData: unknown, websiteUrl: string, testType?: string) => {
    if (!isStructuredError(errorData)) return false;
    const e = errorData as any;

    switch (e.error_type) {
      case "RATE_LIMIT_BLOG": {
        const nextAvailable = e.next_available_time || e.canRetestAt;
        let resetDateStr = "";
        if (nextAvailable) {
          resetDateStr = new Intl.DateTimeFormat("en-IN", {
            weekday: "long",
            month: "long",
            day: "numeric",
            timeZone: "Asia/Kolkata",
          }).format(new Date(nextAvailable)) + " (IST)";
        }

        toast({
          variant: "destructive",
          title: "Blog test limit reached",
          description: `You've tested 3 blog posts in the last 7 days. You can test more blog posts on ${resetDateStr || "next week"}. Homepage tests are unlimited!`,
          duration: 10000,
        });
        break;
      }

      case "RATE_LIMIT_IP": {
        if (e.user_message && testType === "blog") {
          toast({
            variant: "destructive",
            title: "Blog test limit reached",
            description: e.user_message,
            duration: 10000,
          });
          break;
        }

        const blogCount = e.blogCount || e.blog_count;
        const blogLimit = e.blogLimit || e.blog_limit || 3;
        const nextAvailable = e.next_available_time || e.canRetestAt;

        if (testType === "blog" && (blogCount !== undefined || e.is_blog_limit || nextAvailable)) {
          let resetDateStr = "";
          if (nextAvailable) {
            resetDateStr = new Intl.DateTimeFormat("en-IN", {
              weekday: "long",
              month: "long",
              day: "numeric",
              timeZone: "Asia/Kolkata",
            }).format(new Date(nextAvailable)) + " (IST)";
          }

          toast({
            variant: "destructive",
            title: "Blog test limit reached",
            description: `You've tested 3 blog posts in the last 7 days. You can test more on ${resetDateStr || "next week"}. Homepage tests are unlimited!`,
            duration: 10000,
          });
          break;
        }

        const ipCount = e.ipCount || e.ip_count;
        const ipLimit = e.ipLimit || e.ip_limit;
        const description =
          e.user_message ||
          (ipCount && ipLimit
            ? `You've used ${ipCount} of ${ipLimit} free tests today from this network. Try again tomorrow or use a different internet connection (mobile data).`
            : "You've reached the daily testing limit from this network. Try again later or use a different connection.");

        toast({
          variant: "destructive",
          title: "Daily limit reached",
          description,
          duration: 10000,
          action: (
            <ToastAction altText="Contact" onClick={() => navigate("/contact")}>
              Contact Us
            </ToastAction>
          ),
        });
        break;
      }

      case "RATE_LIMIT_URL": {
        const payload = normalizeRateLimitPayload(e);
        let testedIso = payload?.testedAt;
        let canRetestIso = payload?.canRetestAt;

        if (!testedIso && canRetestIso) {
          testedIso = new Date(new Date(canRetestIso).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        }
        if (!canRetestIso && testedIso) {
          canRetestIso = new Date(new Date(testedIso).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }
        const lastTestedDate = testedIso ? new Date(testedIso) : new Date();
        const nextAvailableDate = canRetestIso
          ? new Date(canRetestIso)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        setRetestModalData({
          url: websiteUrl,
          lastTestedDate,
          nextAvailableDate,
          cachedTestId: payload?.testId || "",
          cachedScore: payload?.cachedScore ?? 0,
          attemptsExhausted: payload?.attemptsExhausted ?? false,
        });
        setRetestModalOpen(true);
        break;
      }

      case "SITE_UNREACHABLE":
        toast({
          variant: "destructive",
          title: "Website not reachable",
          description: e.user_message || "We couldn't reach that site — check the URL or try again later.",
          duration: 5000,
        });
        break;

      case "TIMEOUT":
        toast({
          variant: "destructive",
          title: "Request timed out",
          description: e.user_message || "The site took too long to respond. Try again later.",
          duration: 5000,
        });
        break;

      case "API_QUOTA":
        toast({
          variant: "destructive",
          title: "Service temporarily unavailable",
          description: e.user_message || "We're temporarily out of capacity. Try again shortly.",
          duration: 5000,
          action: (
            <ToastAction altText="Notify" onClick={() => navigate("/contact")}>
              Email Me When Fixed
            </ToastAction>
          ),
        });
        break;

      default:
        toast({
          variant: "destructive",
          title: "Analysis failed",
          description: e.user_message || "Unable to analyze this website. Please try again.",
          duration: 5000,
        });
    }

    return true;
  };

  const handleHomepageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHomepageError(null);
    setHomepageSuggestion(null);
    dismiss?.();

    if (!homepageUrl.trim()) {
      setHomepageError("Please enter a website URL");
      return;
    }

    const validation = validateAndNormalizeUrl(homepageUrl);
    if (!validation.valid) {
      const errorMsg = getErrorMessage(validation);
      setHomepageError(errorMsg.description);
      if (validation.suggestion) setHomepageSuggestion(validation.suggestion);
      return;
    }

    const websiteUrl = validation.normalizedUrl!;
    analytics.buttonClick("Get FI Score - Homepage", "homepage_audit");
    setIsLoadingHomepage(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { website: websiteUrl, testType: "homepage" },
      });

      if (error) throw error;

      if (data?.success === true && data?.testId) {
        toast({
          title: "Analysis complete!",
          description: "Loading your results...",
          duration: 2000,
        });
        navigate(`/results?testId=${data.testId}&url=${encodeURIComponent(websiteUrl)}`);
        return;
      }

      if (data?.success === false) {
        const handled = handleAnalysisError(data, websiteUrl);
        if (!handled) {
          toast({
            title: "Analysis failed",
            description: data.error || data.user_message || "Unable to analyze this website",
            variant: "destructive",
            duration: 5000,
          });
        }
        return;
      }

      throw new Error("Unexpected response format");
    } catch (err: unknown) {
      console.error("Homepage submit error:", err);

      toast({
        title: "Unable to analyze website",
        description: "Please check the URL and try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoadingHomepage(false);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogError(null);
    setBlogSuggestion(null);
    dismiss?.();

    if (!blogUrl.trim()) {
      setBlogError("Please enter a blog post URL");
      return;
    }

    const validation = validateAndNormalizeUrl(blogUrl);
    if (!validation.valid) {
      const errorMsg = getErrorMessage(validation);
      setBlogError(errorMsg.description);
      if (validation.suggestion) setBlogSuggestion(validation.suggestion);
      return;
    }

    const websiteUrl = validation.normalizedUrl!;
    analytics.buttonClick("Get FI Score - Blog", "blog_audit");
    setIsLoadingBlog(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { website: websiteUrl, testType: "blog" },
      });

      if (data?.error_type === "RATE_LIMIT_IP") {
        toast({
          variant: "destructive",
          title: "Blog test limit reached",
          description: data.user_message || "You've reached your blog test limit.",
          duration: Infinity,
        });
        return;
      }

      if (error) {
        let errorData: any = null;
        
        if (error.context?.body) {
          try {
            errorData = typeof error.context.body === "string" 
              ? JSON.parse(error.context.body) 
              : error.context.body;
          } catch (e) {}
        }
        
        if (!errorData && error.message) {
          const jsonMatch = error.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              errorData = JSON.parse(jsonMatch[0]);
            } catch (e) {}
          }
        }
        
        if (errorData?.error_type === "RATE_LIMIT_IP") {
          toast({
            variant: "destructive",
            title: "Blog test limit reached",
            description: errorData.user_message || "You've reached your blog test limit.",
            duration: Infinity,
          });
          return;
        }
      }

      if (data && data.success === false && data.error_type) {
        const handled = handleAnalysisError(data, websiteUrl, "blog");
        if (handled) return;
      }

      if (error) {
        let errorData = null;
        
        if (error && typeof error === "object") {
          const errObj = error as any;
          if (errObj.error_type) {
            errorData = errObj;
          } else if (errObj.context?.body) {
            try {
              errorData = typeof errObj.context.body === "string" 
                ? JSON.parse(errObj.context.body) 
                : errObj.context.body;
            } catch (e) {}
          } else if (errObj.message) {
            const jsonMatch = errObj.message.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                errorData = JSON.parse(jsonMatch[0]);
              } catch (e) {}
            }
          }
        }

        if (errorData && errorData.error_type) {
          const handled = handleAnalysisError(errorData, websiteUrl, "blog");
          if (handled) return;
        }

        throw error;
      }

      if (data?.success === true && data?.testId) {
        incrementBlogTestCount();
        toast({
          title: "Analysis complete!",
          description: "Loading your results...",
          duration: 2000,
        });
        navigate(`/results?testId=${data.testId}&url=${encodeURIComponent(websiteUrl)}`);
        return;
      }

      throw new Error("Unexpected response format");
    } catch (err: unknown) {
      let errorData = null;
      if (err && typeof err === "object") {
        const errObj = err as any;
        
        if (errObj.error_type && errObj.user_message) {
          errorData = errObj;
        } else if (errObj.context?.body) {
          try {
            errorData = typeof errObj.context.body === "string" 
              ? JSON.parse(errObj.context.body) 
              : errObj.context.body;
          } catch (e) {}
        } else if (errObj.message) {
          const jsonMatch = errObj.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              errorData = JSON.parse(jsonMatch[0]);
            } catch (e) {}
          }
        }
      }

      if (errorData && errorData.error_type) {
        const handled = handleAnalysisError(errorData, websiteUrl, "blog");
        if (handled) return;
      }
      
      toast({
        title: "Unable to analyze blog post",
        description: "Please check the URL and try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoadingBlog(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <SEOSchema />
        <Header />
        <RateLimitBanner />

        <HeroSection onTestClick={scrollToTestSection} />
        
        <ProblemSection />
        
        <SolutionSection />
        
        <TestSection
          homepageUrl={homepageUrl}
          setHomepageUrl={setHomepageUrl}
          blogUrl={blogUrl}
          setBlogUrl={setBlogUrl}
          isLoadingHomepage={isLoadingHomepage}
          isLoadingBlog={isLoadingBlog}
          homepageError={homepageError}
          blogError={blogError}
          homepageSuggestion={homepageSuggestion}
          blogSuggestion={blogSuggestion}
          setHomepageError={setHomepageError}
          setBlogError={setBlogError}
          setHomepageSuggestion={setHomepageSuggestion}
          setBlogSuggestion={setBlogSuggestion}
          onHomepageSubmit={handleHomepageSubmit}
          onBlogSubmit={handleBlogSubmit}
          dismissToast={dismiss}
        />

        <HowItWorksNew />
        
        <ResultsStats />
        
        <WhoShouldUse />
        
        <FAQNew />
        
        <FinalCTANew onTestClick={scrollToTestSection} />
        
        <Footer />
      </div>

      {retestModalData && (
        <RetestModal
          open={retestModalOpen}
          onClose={() => setRetestModalOpen(false)}
          url={retestModalData.url}
          lastTestedDate={retestModalData.lastTestedDate}
          nextAvailableDate={retestModalData.nextAvailableDate}
          cachedTestId={retestModalData.cachedTestId}
          cachedScore={retestModalData.cachedScore}
          attemptsExhausted={!!retestModalData.attemptsExhausted}
        />
      )}
    </>
  );
};

export default Index;
