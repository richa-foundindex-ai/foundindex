// src/pages/Index.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import SEOSchema from "@/components/SEOSchema";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  Zap,
  Target,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  Search,
  CheckSquare,
  X,
  Check,
} from "lucide-react";
import { analytics } from "@/utils/analytics";
import { validateAndNormalizeUrl, getErrorMessage } from "@/utils/urlValidation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBlogTestCounter } from "@/hooks/useBlogTestCounter";
import { RateLimitBanner } from "@/components/landing/RateLimitBanner";
import { BlogTestCounter } from "@/components/landing/BlogTestCounter";
import { isStructuredError, type ErrorResponse } from "@/utils/errorTypes";
import { ToastAction } from "@/components/ui/toast";
import { RetestModal } from "@/components/RetestModal";

interface RetestModalData {
  url: string;
  lastTestedDate: Date;
  nextAvailableDate: Date;
  cachedTestId: string;
  cachedScore: number;
  attemptsExhausted: boolean;
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

  // -----------------------------
  // Helper: normalize/extract RATE_LIMIT_URL payloads
  // -----------------------------
  const extractRateLimitUrlInfo = (payload: any, websiteUrl: string) => {
    const obj = payload || {};

    const testId = obj.test_id || obj.cached_test_id || obj.testId || obj.cachedTestId || obj.cached_testid || "";
    const cachedScore =
      typeof obj.cached_score === "number"
        ? obj.cached_score
        : typeof obj.cachedScore === "number"
          ? obj.cachedScore
          : undefined;

    // possible fields for testedAt/canRetestAt across different implementations
    const testedAtRaw =
      obj.testedAt ||
      obj.tested_at ||
      obj.cached_created_at ||
      obj.cached_created_at_iso ||
      obj.cachedCreatedAt ||
      obj.cachedCreatedAtIso ||
      null;

    const canRetestRaw = obj.canRetestAt || obj.can_retest_at || obj.next_available_time || obj.canRetestAt || null;

    let testedAtDate = testedAtRaw ? new Date(testedAtRaw) : null;
    let canRetestDate = canRetestRaw ? new Date(canRetestRaw) : null;

    // If only canRetestDate is present compute testedAt = canRetest - 7d
    if (!testedAtDate && canRetestDate) {
      testedAtDate = new Date(canRetestDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    // If only testedAt present compute canRetest = testedAt + 7d
    if (testedAtDate && !canRetestDate) {
      canRetestDate = new Date(testedAtDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    // If neither present use now / now+7d
    if (!testedAtDate && !canRetestDate) {
      testedAtDate = new Date();
      canRetestDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const attemptsExhausted =
      obj.attempts_exhausted === true ||
      obj.attemptsExceeded === true ||
      (typeof obj.attempts === "number" && obj.attempts >= 3) ||
      false;

    return {
      testId,
      cachedScore,
      testedAtDate,
      canRetestDate,
      attemptsExhausted,
      raw: obj,
    };
  };

  // -----------------------------
  // handleAnalysisError: central handler for structured errors
  // -----------------------------
  const handleAnalysisError = (errorData: unknown, websiteUrl: string) => {
    if (!isStructuredError(errorData)) return false;
    const payload = errorData as ErrorResponse;

    // RATE_LIMIT_IP => small toast with counts (if present)
    if (payload.error_type === "RATE_LIMIT_IP") {
      const ipCount = (payload as any).ipCount || (payload as any).ip_count;
      const ipLimit = (payload as any).ipLimit || (payload as any).ip_limit;
      const description =
        payload.user_message ||
        (ipCount && ipLimit
          ? `You've used ${ipCount} of ${ipLimit} free tests today from this network. Try again tomorrow or use a different connection (mobile data).`
          : "You've reached the daily testing limit from this network. Try again later.");

      toast({
        variant: "destructive",
        title: "Daily limit reached",
        description,
        duration: 5000,
        action: (
          <ToastAction altText="Contact" onClick={() => navigate("/contact")}>
            Contact Us
          </ToastAction>
        ),
      });
      return true;
    }

    // RATE_LIMIT_URL => show centered modal with retest info
    if (payload.error_type === "RATE_LIMIT_URL") {
      const info = extractRateLimitUrlInfo(payload as any, websiteUrl);

      setRetestModalData({
        url: websiteUrl,
        lastTestedDate: info.testedAtDate,
        nextAvailableDate: info.canRetestDate,
        cachedTestId: info.testId || "",
        cachedScore: info.cachedScore ?? 0,
        attemptsExhausted: info.attemptsExhausted,
      });
      setRetestModalOpen(true);
      return true;
    }

    // SITE_UNREACHABLE
    if (payload.error_type === "SITE_UNREACHABLE") {
      toast({
        variant: "destructive",
        title: "Website not reachable",
        description: payload.user_message || "We couldn't reach that site — check the URL or try again later.",
        duration: 5000,
      });
      return true;
    }

    // TIMEOUT
    if (payload.error_type === "TIMEOUT") {
      toast({
        variant: "destructive",
        title: "Request timed out",
        description: payload.user_message || "The site took too long to respond. Try again later.",
        duration: 5000,
      });
      return true;
    }

    // API_QUOTA / other service errors
    if (payload.error_type === "API_QUOTA") {
      toast({
        variant: "destructive",
        title: "Service temporarily unavailable",
        description: payload.user_message || "We're temporarily out of capacity. Try again shortly.",
        duration: 5000,
        action: (
          <ToastAction altText="Notify" onClick={() => navigate("/contact")}>
            Email Me When Fixed
          </ToastAction>
        ),
      });
      return true;
    }

    // fallback: generic user-friendly toast
    toast({
      variant: "destructive",
      title: "Analysis failed",
      description: payload.user_message || "Unable to analyze this website. Please try again.",
      duration: 5000,
    });
    return true;
  };

  // -----------------------------
  // handleHomepageSubmit
  // -----------------------------
  const handleHomepageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHomepageError(null);
    setHomepageSuggestion(null);

    // dismiss any existing toasts before starting
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
    analytics.buttonClick("Get FI Score - Homepage", "homepage audit");
    setIsLoadingHomepage(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { website: websiteUrl, testType: "homepage" },
      });

      if (error) throw error;

      // backend indicates a handled failure
      if (data?.success === false) {
        const handled = handleAnalysisError(data, websiteUrl);
        if (!handled) {
          toast({
            title: "Analysis failed",
            description: data.error || "Unable to analyze this website",
            variant: "destructive",
            duration: 5000,
          });
        }
        setIsLoadingHomepage(false);
        return;
      }

      if (data?.testId) {
        toast({ title: "Analysis complete!", description: "Loading your results...", duration: 2000 });
        navigate(`/results?testId=${data.testId}&url=${encodeURIComponent(websiteUrl)}`);
      } else {
        throw new Error("No test ID returned");
      }
    } catch (err: unknown) {
      console.error("Homepage submit error:", err);

      // try to extract structured payload if the thrown object contains JSON
      let errorBody: unknown = null;
      if (err instanceof Error && err.message) {
        const jsonMatch = err.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            errorBody = JSON.parse(jsonMatch[0]);
          } catch {}
        }
      }
      // check for supabase context body
      if (!errorBody && err && typeof err === "object" && "context" in err) {
        const ctx = (err as any).context;
        if (ctx?.body) {
          try {
            errorBody = JSON.parse(ctx.body);
          } catch {}
        }
      }

      if (errorBody && handleAnalysisError(errorBody, websiteUrl)) {
        setIsLoadingHomepage(false);
        return;
      }

      // generic fallback
      toast({
        title: "Unable to analyze website",
        description: "Please check the URL and try again. If it keeps failing, contact us.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoadingHomepage(false);
    }
  };

  // -----------------------------
  // handleBlogSubmit
  // -----------------------------
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogError(null);
    setBlogSuggestion(null);

    // dismiss any existing toasts before starting
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
    analytics.buttonClick("Get FI Score - Blog", "blog audit");
    setIsLoadingBlog(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { website: websiteUrl, testType: "blog" },
      });

      if (error) throw error;

      if (data?.success === false) {
        const handled = handleAnalysisError(data, websiteUrl);
        if (!handled) {
          toast({
            title: "Analysis failed",
            description: data.error || "Unable to analyze this website",
            variant: "destructive",
            duration: 5000,
          });
        }
        setIsLoadingBlog(false);
        return;
      }

      if (data?.testId) {
        // increment local blog counter for UI
        try {
          incrementBlogTestCount();
        } catch {
          // noop if hook fails
        }
        toast({ title: "Analysis complete!", description: "Loading your results...", duration: 2000 });
        navigate(`/results?testId=${data.testId}&url=${encodeURIComponent(websiteUrl)}`);
      } else {
        throw new Error("No test ID returned");
      }
    } catch (err: unknown) {
      console.error("Blog submit error:", err);

      let errorBody: unknown = null;
      if (err instanceof Error && err.message) {
        const jsonMatch = err.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            errorBody = JSON.parse(jsonMatch[0]);
          } catch {}
        }
      }
      if (!errorBody && err && typeof err === "object" && "context" in err) {
        const ctx = (err as any).context;
        if (ctx?.body) {
          try {
            errorBody = JSON.parse(ctx.body);
          } catch {}
        }
      }

      if (errorBody && handleAnalysisError(errorBody, websiteUrl)) {
        setIsLoadingBlog(false);
        return;
      }

      toast({
        title: "Unable to analyze blog post",
        description: "Please check the URL and try again. If it persists, contact us.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoadingBlog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOSchema />
      <Header />

      {/* Rate limit transparency banner */}
      <RateLimitBanner />
      <header className="container mx-auto px-4 py-12 md:py-24 text-center">
        <p className="text-sm md:text-base font-semibold text-destructive mb-4">
          Your SEO is fine. AI still can't find you.
        </p>

        <h1 className="text-[2rem] md:text-6xl font-bold mb-6 text-foreground leading-tight px-2">
          Score your website's visibility to AI search engines
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto px-4">
          ChatGPT, Perplexity, and Claude don't rank pages—they cite sources. FoundIndex analyzes if your website is
          structured clearly enough for AI to understand, parse, and recommend.
        </p>

        {/* Social proof row */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-8">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>
              <strong>217+</strong> websites tested
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>
              <strong>47</strong> criteria analyzed
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>
              <strong>60 seconds</strong> to score
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <a
          href="#test-section"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("test-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-block"
        >
          <Button
            size="lg"
            className="h-14 px-10 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Test your site free
          </Button>
        </a>
      </header>

      {/* Explanation cards */}
      <section className="container mx-auto px-4 pb-12 md:pb-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <article className="p-6 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="font-bold text-foreground">The Problem</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Google ranks pages. AI cites sources. Your SEO strategy doesn't prepare you for ChatGPT, Perplexity, or
              Claude—which now drive 10%+ of search queries.
            </p>
          </article>

          <article className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <ClipboardList className="h-6 w-6 text-blue-500" />
              <h3 className="font-bold text-foreground">What We Check</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Schema markup, semantic structure, content clarity, authority signals, and 40+ other criteria that
              determine if AI can parse and cite your content.
            </p>
          </article>

          <article className="p-6 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-6 w-6 text-green-500" />
              <h3 className="font-bold text-foreground">What You Get</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              A 0-100 score with prioritized recommendations and copy-paste code examples. Fix issues in minutes, not
              months. Retest to track improvement.
            </p>
          </article>
        </div>
      </section>

      {/* Comparison Section - How FoundIndex is Different */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-4 text-foreground">Not Another Brand Monitor</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-lg">
            Most AI visibility tools tell you IF you're being mentioned. FoundIndex tells you WHY you're not—and how to
            fix it.
          </p>

          {/* Comparison Table */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="overflow-x-auto pb-2 relative">
              <div className="md:hidden text-xs text-muted-foreground text-center mb-2 flex items-center justify-center gap-2">
                <span>← Scroll to compare →</span>
              </div>
              <table className="w-full min-w-[800px] border-collapse bg-background rounded-lg overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-[#1a365d] text-white">
                    <th className="text-left p-4 font-semibold w-[28%]">Feature</th>
                    <th className="text-center p-4 font-semibold w-[22%]">HubSpot AEO Grader</th>
                    <th className="text-center p-4 font-semibold w-[22%]">Semrush AI Visibility</th>
                    <th className="text-center p-4 font-semibold w-[28%] bg-blue-600">FoundIndex</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 font-medium text-foreground">What it measures</td>
                    <td className="p-4 text-center text-muted-foreground text-sm">Brand mentions in AI answers</td>
                    <td className="p-4 text-center text-muted-foreground text-sm">Brand share of voice across AI</td>
                    <td className="p-4 text-center bg-blue-50 dark:bg-blue-950/30 font-medium text-foreground text-sm">
                      Page structure & AI readability
                    </td>
                  </tr>
                  {/* ... rest of table unchanged */}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparison note */}
          <p className="text-center text-muted-foreground text-sm max-w-3xl mx-auto mb-12 italic">
            Semrush/HubSpot track mentions AFTER AI knows you. FoundIndex fixes structure BEFORE discovery.
          </p>

          {/* Differentiator Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <article className="p-6 bg-background rounded-lg shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-foreground">The Scoreboard vs The Playbook</h3>
              <p className="text-muted-foreground text-sm">
                HubSpot and Semrush show the scoreboard—how often AI mentions your brand. FoundIndex gives you the
                playbook—exactly what to change so AI can understand and cite your content.
              </p>
            </article>

            <article className="p-6 bg-background rounded-lg shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-foreground">Page-Level, Not Brand-Level</h3>
              <p className="text-muted-foreground text-sm">
                Brand monitors work for Nike and HubSpot. But if AI has never heard of you, they can't help. FoundIndex
                analyzes your actual content and tells you what's blocking AI from finding it.
              </p>
            </article>

            <article className="p-6 bg-background rounded-lg shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <CheckSquare className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-foreground">Fix It, Then Prove It</h3>
              <p className="text-muted-foreground text-sm">
                Use your FoundIndex score as a baseline. Make the recommended changes. Re-test. Show clients the
                improvement. That's how you prove ROI on AI optimization work.
              </p>
            </article>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="#test-section"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("test-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Test Your Page Now →
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* URL Input Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {/* Test cards */}
        <div
          id="test-section"
          className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto scroll-mt-8"
        >
          {/* Homepage card */}
          <Card className="relative bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🏠</div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-foreground">Homepage audit</h2>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  ✨ Unlimited
                </span>
              </div>
              <p className="text-muted-foreground mb-6">Test if AI can understand what your business does</p>

              <form onSubmit={handleHomepageSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="yourcompany.com"
                    value={homepageUrl}
                    onFocus={() => dismiss?.()}
                    onChange={(e) => {
                      setHomepageUrl(e.target.value);
                      setHomepageError(null);
                      setHomepageSuggestion(null);
                      dismiss?.();
                    }}
                    className={`h-12 text-base min-h-[48px] ${homepageError ? "border-destructive" : ""}`}
                    style={{ fontSize: "16px" }}
                    required
                    aria-label="Homepage URL"
                  />
                  {homepageError && (
                    <div className="flex items-start gap-2 text-sm text-destructive mt-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span>{homepageError}</span>
                        {homepageSuggestion && (
                          <button
                            type="button"
                            onClick={() => {
                              setHomepageUrl(homepageSuggestion);
                              setHomepageError(null);
                              setHomepageSuggestion(null);
                            }}
                            className="ml-1 text-primary hover:underline font-medium"
                          >
                            Use "{homepageSuggestion}"?
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white min-h-[48px]"
                  disabled={isLoadingHomepage}
                >
                  {isLoadingHomepage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing (~60s)
                    </>
                  ) : (
                    "Get your FI score"
                  )}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                Unlimited tests • <span className="font-bold text-foreground">Free during beta</span>
              </p>
            </CardContent>
          </Card>

          {/* Blog card */}
          <Card className="relative bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 transition-all duration-300">
            <Badge className="absolute top-4 right-4 bg-amber-500 text-white">Most popular</Badge>

            <CardContent className="p-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Blog post audit</h2>
              <p className="text-muted-foreground mb-6">Test if AI can extract and cite your answers</p>

              <form onSubmit={handleBlogSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="yoursite.com/blog/post-title"
                    value={blogUrl}
                    onFocus={() => dismiss?.()}
                    onChange={(e) => {
                      setBlogUrl(e.target.value);
                      setBlogError(null);
                      setBlogSuggestion(null);
                      dismiss?.();
                    }}
                    className={`h-12 text-base min-h-[48px] ${blogError ? "border-destructive" : ""}`}
                    style={{ fontSize: "16px" }}
                    required
                    aria-label="Blog post URL"
                  />
                  {blogError && (
                    <div className="flex items-start gap-2 text-sm text-destructive mt-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span>{blogError}</span>
                        {blogSuggestion && (
                          <button
                            type="button"
                            onClick={() => {
                              setBlogUrl(blogSuggestion);
                              setBlogError(null);
                              setBlogSuggestion(null);
                            }}
                            className="ml-1 text-primary hover:underline font-medium"
                          >
                            Use "{blogSuggestion}"?
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-purple-600 hover:bg-purple-700 text-white min-h-[48px]"
                  disabled={isLoadingBlog}
                >
                  {isLoadingBlog ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing (~60s)
                    </>
                  ) : (
                    "Get your FI score"
                  )}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                3 posts/week · <span className="font-bold text-foreground">Free during beta</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Blog test counter */}
        <div className="max-w-5xl mx-auto mt-4">
          <BlogTestCounter />
        </div>
      </section>

      {/* What we analyze */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-4 text-foreground">
            47+ criteria. 6 categories. One score.
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We analyze what AI systems actually look for when deciding whether to cite your content
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-background rounded-lg">
              <Target className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold mb-2">Schema markup</h3>
              <p className="text-sm text-muted-foreground">JSON-LD, Organization, Article, FAQ schemas</p>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <Zap className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold mb-2">Content clarity</h3>
              <p className="text-sm text-muted-foreground">Front-loaded answers, clear value props</p>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <Shield className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold mb-2">Authority signals</h3>
              <p className="text-sm text-muted-foreground">Credentials, citations, expertise markers</p>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold mb-2">Semantic HTML</h3>
              <p className="text-sm text-muted-foreground">Article, section, nav, figure tags</p>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <Target className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold mb-2">Technical foundation</h3>
              <p className="text-sm text-muted-foreground">Meta tags, canonicals, mobile-ready</p>
            </div>

            <div className="text-center p-6 bg-background rounded-lg">
              <Zap className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold mb-2">Scannability</h3>
              <p className="text-sm text-muted-foreground">Headings, lists, short paragraphs</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-foreground">How it works</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">1️⃣</div>
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">Enter your URL</h3>
            <p className="text-sm md:text-base text-muted-foreground">Any page, any site</p>
          </div>

          <div className="text-center">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">2️⃣</div>
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">Get your score</h3>
            <p className="text-sm md:text-base text-muted-foreground">0-100 in 60 seconds</p>
          </div>

          <div className="text-center">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">3️⃣</div>
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">Fix the issues</h3>
            <p className="text-sm md:text-base text-muted-foreground">Prioritized action list</p>
          </div>

          <div className="text-center">
            <div className="text-4xl md:text-5xl mb-3 md:mb-4">4️⃣</div>
            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">Track progress</h3>
            <p className="text-sm md:text-base text-muted-foreground">Retest after changes</p>
          </div>
        </div>
      </section>

      {/* Beta benefits */}
      <section className="bg-muted py-16 md:py-24">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-foreground">
          🎉 Beta tester perks
        </h2>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Full access free</h3>
                <p className="text-muted-foreground">Every diagnostic, every recommendation</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="text-5xl mb-4">🔄</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Weekly retests</h3>
                <p className="text-muted-foreground">Track improvements over time</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Priority support</h3>
                <p className="text-muted-foreground">Direct line to the founder</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground text-center md:text-left">
            <div className="order-2 md:order-1">
              Built by{" "}
              <a
                href="https://richadeo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Richa Deo
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 order-1 md:order-2">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>

            <div className="order-3">© 2025 FoundIndex</div>
          </div>
        </div>
      </footer>

      {/* Retest Modal */}
      {retestModalData && (
        <RetestModal
          open={retestModalOpen}
          onClose={() => setRetestModalOpen(false)}
          url={retestModalData.url}
          lastTestedDate={retestModalData.lastTestedDate}
          nextAvailableDate={retestModalData.nextAvailableDate}
          cachedTestId={retestModalData.cachedTestId}
          cachedScore={retestModalData.cachedScore}
          attemptsExhausted={retestModalData.attemptsExhausted}
        />
      )}
    </div>
  );
};

export default Index;
