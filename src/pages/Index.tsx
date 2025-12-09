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
import { Loader2, AlertCircle } from "lucide-react";
import { analytics } from "@/utils/analytics";
import { validateAndNormalizeUrl, getErrorMessage } from "@/utils/urlValidation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBlogTestCounter } from "@/hooks/useBlogTestCounter";
import { RateLimitBanner } from "@/components/landing/RateLimitBanner";
import { BlogTestCounter } from "@/components/landing/BlogTestCounter";
import { isStructuredError } from "@/utils/errorTypes";
import { ToastAction } from "@/components/ui/toast";
import { RetestModal } from "@/components/RetestModal";

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

  const handleAnalysisError = (errorData: unknown, websiteUrl: string) => {
    if (!isStructuredError(errorData)) return false;
    const e = errorData as any;

    switch (e.error_type) {
      case "RATE_LIMIT_IP": {
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
          duration: 5000,
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

      if (error) throw error;

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

      if (data?.success === false) {
        const handled = handleAnalysisError(data, websiteUrl);
        if (!handled) {
          toast({
            title: "Analysis failed",
            description: data.error || data.user_message || "Unable to analyze this blog post",
            variant: "destructive",
            duration: 5000,
          });
        }
        return;
      }

      throw new Error("Unexpected response format");
    } catch (err: unknown) {
      console.error("Blog submit error:", err);

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

        <header className="container mx-auto px-4 py-12 md:py-24 text-center">
          <p className="text-sm md:text-base font-semibold text-destructive mb-4">
            Your SEO is fine. AI still cannot find you.
          </p>
          <h1 className="text-[2rem] md:text-6xl font-bold mb-6 text-foreground leading-tight px-2">
            Score your website visibility to AI search engines
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-3xl mx-auto px-4">
            ChatGPT, Perplexity, and Claude do not rank pages. They cite sources. FoundIndex analyzes if your website
            is structured clearly enough for AI to understand, parse, and recommend.
          </p>

          
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

        <section className="container mx-auto px-4 py-12 md:py-16">
          <div
            id="test-section"
            className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto scroll-mt-8"
          >
            <Card className="relative bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🏠</div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">Homepage audit</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
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
                              Use {homepageSuggestion}?
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white"
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
                              Use {blogSuggestion}?
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-purple-600 hover:bg-purple-700 text-white"
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
                  3 posts/week • <span className="font-bold text-foreground">Free during beta</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-5xl mx-auto mt-4">
            <BlogTestCounter />
          </div>
        </section>

        <Testimonials />
        <FAQ />

        <footer className="border-t border-border bg-muted py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground text-center md:text-left">
              <div className="order-2 md:order-1">
                Built by{" "}
                
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