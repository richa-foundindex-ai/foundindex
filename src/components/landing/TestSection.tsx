import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { BlogTestCounter } from "./BlogTestCounter";

interface TestSectionProps {
  homepageUrl: string;
  setHomepageUrl: (url: string) => void;
  blogUrl: string;
  setBlogUrl: (url: string) => void;
  isLoadingHomepage: boolean;
  isLoadingBlog: boolean;
  homepageError: string | null;
  blogError: string | null;
  homepageSuggestion: string | null;
  blogSuggestion: string | null;
  setHomepageError: (error: string | null) => void;
  setBlogError: (error: string | null) => void;
  setHomepageSuggestion: (suggestion: string | null) => void;
  setBlogSuggestion: (suggestion: string | null) => void;
  onHomepageSubmit: (e: React.FormEvent) => void;
  onBlogSubmit: (e: React.FormEvent) => void;
  dismissToast?: () => void;
}

const TestSection = ({
  homepageUrl,
  setHomepageUrl,
  blogUrl,
  setBlogUrl,
  isLoadingHomepage,
  isLoadingBlog,
  homepageError,
  blogError,
  homepageSuggestion,
  blogSuggestion,
  setHomepageError,
  setBlogError,
  setHomepageSuggestion,
  setBlogSuggestion,
  onHomepageSubmit,
  onBlogSubmit,
  dismissToast
}: TestSectionProps) => {
  return (
    <section id="url-input-section" className="container mx-auto px-4 py-12 md:py-16 scroll-mt-20">
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

            <form onSubmit={onHomepageSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="yourcompany.com"
                  value={homepageUrl}
                  onFocus={() => dismissToast?.()}
                  onChange={(e) => {
                    setHomepageUrl(e.target.value);
                    setHomepageError(null);
                    setHomepageSuggestion(null);
                    dismissToast?.();
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
                          Use suggested URL?
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
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

            <form onSubmit={onBlogSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="yoursite.com/blog/post-title"
                  value={blogUrl}
                  onFocus={() => dismissToast?.()}
                  onChange={(e) => {
                    setBlogUrl(e.target.value);
                    setBlogError(null);
                    setBlogSuggestion(null);
                    dismissToast?.();
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
                          Use suggested URL?
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
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
  );
};

export default TestSection;
