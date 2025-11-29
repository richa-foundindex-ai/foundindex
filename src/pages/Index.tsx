import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { analytics } from "@/utils/analytics";
import { validateAndNormalizeUrl, getErrorMessage } from "@/utils/urlValidation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [homepageUrl, setHomepageUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [isLoadingHomepage, setIsLoadingHomepage] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);
  const [homepageError, setHomepageError] = useState<string | null>(null);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [homepageSuggestion, setHomepageSuggestion] = useState<string | null>(null);
  const [blogSuggestion, setBlogSuggestion] = useState<string | null>(null);

  useEffect(() => {
    analytics.pageView("homepage");
  }, []);

  const handleHomepageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHomepageError(null);
    setHomepageSuggestion(null);

    if (!homepageUrl.trim()) {
      setHomepageError("Please enter a website URL");
      return;
    }

    const validation = validateAndNormalizeUrl(homepageUrl);
    if (!validation.valid) {
      const errorMsg = getErrorMessage(validation);
      setHomepageError(errorMsg.description);
      if (validation.suggestion) {
        setHomepageSuggestion(validation.suggestion);
      }
      return;
    }

    const websiteUrl = validation.normalizedUrl!;

    // ✅ RATE LIMITING - Check if URL tested in last 7 days
    const { data: recentTests } = await supabase
      .from("test_history")
      .select("test_id, score, created_at")
      .eq("website", websiteUrl)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentTests && recentTests.length > 0) {
      const test = recentTests[0];
      const daysAgo = Math.floor((Date.now() - new Date(test.created_at).getTime()) / (24 * 60 * 60 * 1000));

      toast({
        title: "URL tested recently",
        description: `You tested this URL ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago. You can retest in ${7 - daysAgo} day${7 - daysAgo === 1 ? "" : "s"}. Made changes? Email hello@foundindex.com to retest early.`,
      });

      navigate(`/results?testId=${test.test_id}&url=${encodeURIComponent(websiteUrl)}`);
      return;
    }

    analytics.buttonClick("Get FI Score - Homepage", "homepage audit");
    setIsLoadingHomepage(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: {
          website: websiteUrl,
          testType: "homepage",
        },
      });

      if (error) throw error;

      if (data?.success === false) {
        toast({
          title: "Analysis failed",
          description: data.error || "Unable to analyze this website",
          variant: "destructive",
        });
        setIsLoadingHomepage(false);
        return;
      }

      if (data?.testId) {
        toast({
          title: "Analysis complete!",
          description: "Loading your results...",
        });
        navigate(`/results?testId=${data.testId}&url=${encodeURIComponent(websiteUrl)}`);
      } else {
        throw new Error("No test ID returned");
      }
    } catch (error) {
      console.error("Homepage submit error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsLoadingHomepage(false);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogError(null);
    setBlogSuggestion(null);

    if (!blogUrl.trim()) {
      setBlogError("Please enter a blog post URL");
      return;
    }

    const validation = validateAndNormalizeUrl(blogUrl);
    if (!validation.valid) {
      const errorMsg = getErrorMessage(validation);
      setBlogError(errorMsg.description);
      if (validation.suggestion) {
        setBlogSuggestion(validation.suggestion);
      }
      return;
    }

    const websiteUrl = validation.normalizedUrl!;

    // ✅ RATE LIMITING - Check if URL tested in last 7 days
    const { data: recentTests } = await supabase
      .from("test_history")
      .select("test_id, score, created_at")
      .eq("website", websiteUrl)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentTests && recentTests.length > 0) {
      const test = recentTests[0];
      const daysAgo = Math.floor((Date.now() - new Date(test.created_at).getTime()) / (24 * 60 * 60 * 1000));

      toast({
        title: "URL tested recently",
        description: `You tested this URL ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago. You can retest in ${7 - daysAgo} day${7 - daysAgo === 1 ? "" : "s"}. Made changes? Email hello@foundindex.com to retest early.`,
      });

      navigate(`/results?testId=${test.test_id}&url=${encodeURIComponent(websiteUrl)}`);
      return;
    }

    analytics.buttonClick("Get FI Score - Blog", "blog audit");
    setIsLoadingBlog(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: {
          website: websiteUrl,
          testType: "blog",
        },
      });

      if (error) throw error;

      if (data?.success === false) {
        toast({
          title: "Analysis failed",
          description: data.error || "Unable to analyze this website",
          variant: "destructive",
        });
        setIsLoadingBlog(false);
        return;
      }

      if (data?.testId) {
        toast({
          title: "Analysis complete!",
          description: "Loading your results...",
        });
        navigate(`/results?testId=${data.testId}&url=${encodeURIComponent(websiteUrl)}`);
      } else {
        throw new Error("No test ID returned");
      }
    } catch (error) {
      console.error("Blog submit error:", error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsLoadingBlog(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="container mx-auto px-4 py-12 md:py-24 text-center">
        <Badge className="mb-6 text-sm md:text-base px-4 md:px-6 py-2 bg-primary text-primary-foreground hover:bg-primary-hover">
          🚀 FREE BETA
        </Badge>

        <h1 className="text-[2rem] md:text-6xl font-bold mb-6 text-foreground leading-tight px-2">
          Will AI search engines find your content?
        </h1>

        <p className="text-lg md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto px-4">
          Get your FI Score™ in 60 seconds. See exactly what's blocking AI tools from finding your content.
        </p>

        <p className="text-sm text-muted-foreground px-4">
          Join 500+ early testers | Built on Microsoft's AI optimization framework
        </p>
      </section>

      <section className="container mx-auto px-4 pb-12 md:pb-16">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          <Card className="relative bg-gradient-to-br from-blue-light to-background border-2 border-blue/20 hover:border-blue/40 transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Homepage audit</h2>
              <p className="text-muted-foreground mb-6">Test business clarity and positioning</p>

              <form onSubmit={handleHomepageSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="slack.com or https://yoursite.com"
                    value={homepageUrl}
                    onChange={(e) => {
                      setHomepageUrl(e.target.value);
                      setHomepageError(null);
                      setHomepageSuggestion(null);
                    }}
                    className={`h-12 md:h-12 text-base min-h-[48px] ${homepageError ? "border-destructive" : ""}`}
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
                  className="w-full h-12 md:h-12 text-base bg-blue hover:bg-blue/90 text-white min-h-[48px]"
                  disabled={isLoadingHomepage}
                  aria-label="Get FI Score for Homepage"
                >
                  {isLoadingHomepage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing... (~60s)
                    </>
                  ) : (
                    "Get your FI score"
                  )}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                Normally $97 | <span className="font-bold text-foreground">FREE during beta</span>
              </p>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-purple-light to-background border-2 border-purple/20 hover:border-purple/40 transition-all duration-300">
            <Badge className="absolute top-4 right-4 bg-warning text-warning-foreground">MOST POPULAR</Badge>

            <CardContent className="p-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Blog post audit</h2>
              <p className="text-muted-foreground mb-6">Test AI readability and structure</p>

              <form onSubmit={handleBlogSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="slack.com/blog/post or https://yoursite.com/blog/post"
                    value={blogUrl}
                    onChange={(e) => {
                      setBlogUrl(e.target.value);
                      setBlogError(null);
                      setBlogSuggestion(null);
                    }}
                    className={`h-12 md:h-12 text-base min-h-[48px] ${blogError ? "border-destructive" : ""}`}
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
                  className="w-full h-12 md:h-12 text-base bg-purple hover:bg-purple/90 text-white min-h-[48px]"
                  disabled={isLoadingBlog}
                  aria-label="Get FI Score for Blog Post"
                >
                  {isLoadingBlog ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing... (~60s)
                    </>
                  ) : (
                    "Get your FI score"
                  )}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                Normally $27 | <span className="font-bold text-foreground">FREE during beta</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-foreground">How it works</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">1️⃣</div>
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">Enter your URL</h3>
              <p className="text-sm md:text-base text-muted-foreground">Test any page instantly</p>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">2️⃣</div>
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">Get your FI Score™</h3>
              <p className="text-sm md:text-base text-muted-foreground">See your 0-100 score</p>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">3️⃣</div>
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">Review recommendations</h3>
              <p className="text-sm md:text-base text-muted-foreground">Get specific fixes</p>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">4️⃣</div>
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">Track improvements</h3>
              <p className="text-sm md:text-base text-muted-foreground">Retest anytime</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-foreground">
          🎉 Beta tester benefits
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">All features free</h3>
              <p className="text-muted-foreground">Access every diagnostic tool at no cost</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">♾️</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Unlimited tests</h3>
              <p className="text-muted-foreground">Test as many pages as you want</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Priority support</h3>
              <p className="text-muted-foreground">Get help when you need it most</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground text-center md:text-left">
            <div className="order-2 md:order-1">
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

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 order-1 md:order-2">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy policy
              </a>
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="mailto:hello@foundindex.com" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>

            <div className="order-3">© 2025 FoundIndex</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
