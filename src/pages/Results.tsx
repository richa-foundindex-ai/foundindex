import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Share2, Download, BarChart3, Target, Globe2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QueryResult {
  queryNumber: number;
  queryText: string;
  engine: string;
  wasRecommended: boolean;
  contextSnippet: string;
  recommendationPosition: number | null;
  qualityRating: string;
}

interface TestResult {
  testId: string;
  foundIndexScore: number;
  contentClarityScore?: number;
  structuredDataScore?: number;
  authorityScore?: number;
  discoverabilityScore?: number;
  comparisonScore?: number;
  analysisDetails?: {
    content_clarity?: string;
    structured_data?: string;
    authority?: string;
    discoverability?: string;
    comparison?: string;
  };
  recommendations?: string[];
  chatgptScore: number;
  claudeScore: number;
  perplexityScore: number;
  recommendationsCount: number;
  recommendationRate: number;
  website?: string;
  industry?: string;
  businessType?: string;
  generatedQueries?: string[];
  testDate?: string;
  queryResults?: QueryResult[];
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!testId) {
        setError("No test ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase.functions.invoke("fetch-results", {
          body: { testId },
        });

        if (fetchError) throw new Error(fetchError.message);
        if (data?.error) throw new Error(data.error);

        setResult(data as TestResult);
      } catch (err) {
        console.error("[Results] Failed to fetch results", err);
        setError(err instanceof Error ? err.message : "Failed to fetch results");
        toast.error("Failed to load test results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId]);

  const getScoreColor = (score: number) => {
    if (score <= 40) return "text-destructive";
    if (score <= 70) return "text-amber-500";
    return "text-emerald-500";
  };

  const getScoreBg = (score: number) => {
    if (score <= 40) return "bg-destructive/10";
    if (score <= 70) return "bg-amber-500/10";
    return "bg-emerald-500/10";
  };

  const getPercentile = (score: number) => {
    if (score <= 40) return "Better than 25% of tested sites";
    if (score <= 70) return "Better than 58% of tested sites";
    return "Better than 85% of tested sites";
  };

  const handleShare = () => {
    if (!result) return;
    const score = result.foundIndexScore ?? 0;
    const text = `I scored ${score}/100 on FoundIndex AI-Readiness!\n\n${getPercentile(score)}\n\nTest your site: ${window.location.origin}`;

    if (navigator.share) {
      navigator.share({ title: "My FoundIndex Score", text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => toast.success("Copied to clipboard"),
        () => toast.error("Failed to copy")
      );
    }
  };

  const handleCopyShare = async () => {
    if (!result) return;
    const score = result.foundIndexScore ?? 0;
    const shareText = `I just analyzed my website's AI-readiness with FoundIndex. Score: ${score}/100

Test yours: ${window.location.origin}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('✅ Link copied to clipboard!', { duration: 5000 });
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Testing Your Website</h1>
          <div className="space-y-2 text-muted-foreground text-sm">
            <p>Fetching your website...</p>
            <p>Analyzing content clarity...</p>
            <p>Checking structured data...</p>
            <p>Evaluating authority signals...</p>
            <p>Assessing discoverability...</p>
            <p>Reviewing comparison content...</p>
            <p>Calculating your score...</p>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Usually takes 3 minutes</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <XCircle className="h-10 w-10 text-destructive mx-auto" />
          <h1 className="text-xl font-semibold">Couldn&apos;t load results</h1>
          <p className="text-sm text-muted-foreground">{error ?? "Something went wrong"}</p>
          <Button asChild><Link to="/">Run new test</Link></Button>
        </Card>
      </div>
    );
  }

  const score = result.foundIndexScore ?? 0;

  return (
    <div className="min-h-screen bg-background/40">
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              Your AI-readiness score
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Based on analysis of your website's content and structure
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {result.website && <Badge variant="outline">{result.website}</Badge>}
              {result.industry && <Badge variant="secondary">Industry: {result.industry}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className={`p-6 space-y-4 ${getScoreBg(score)}`}>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">FoundIndex Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</span>
              <span className="text-muted-foreground">/100</span>
            </div>
            <p className="text-sm font-medium">{getPercentile(score)}</p>
            <Progress value={score} className="h-2" />
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-semibold">What we evaluated</h2>
            {[
              { label: "Content clarity", score: result.contentClarityScore, max: 25 },
              { label: "Structured data", score: result.structuredDataScore, max: 20 },
              { label: "Authority signals", score: result.authorityScore, max: 20 },
              { label: "Discoverability", score: result.discoverabilityScore, max: 20 },
              { label: "Comparison content", score: result.comparisonScore, max: 15 },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{item.label} ({item.score ?? 0}/{item.max})</span>
                  <span className="text-xs text-muted-foreground">
                    {item.score ?? 0}/{item.max}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={((item.score ?? 0) / item.max) * 100} className="h-1.5 flex-1" />
                  {(item.score ?? 0) > (item.max * 0.7) ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.label === "Content clarity" && "How clearly you explain what you do"}
                  {item.label === "Structured data" && "How organized your information is"}
                  {item.label === "Authority signals" && "Evidence of credibility and trust"}
                  {item.label === "Discoverability" && "How easy key information is to find"}
                  {item.label === "Comparison content" && "Context for how you're different"}
                </p>
              </div>
            ))}
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.8fr_1.2fr]">
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold">How to improve your score</h2>
            <div className="space-y-4">
              {(result.recommendations ?? []).length > 0 ? (
                (result.recommendations ?? []).slice(0, 3).map((rec, i) => (
                  <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium flex-1">{rec}</p>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">+5–8 pts</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-9">
                      Why this matters: Helps AI models understand and recommend your site more confidently.
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    Great score! Your site is already well-optimized for AI readability. Keep your content fresh and continue building authority.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5 space-y-3 bg-muted/40">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Share your score</h2>
              </div>
              <div className="rounded-md bg-background border px-3 py-2 text-xs">
                <p className="font-medium">I just analyzed my website's AI-readiness with FoundIndex. Score: {score}/100</p>
                <p className="mt-1 text-xs text-primary">Test yours: {window.location.origin}</p>
              </div>
              <Button size="sm" className="w-full" variant="outline" onClick={handleCopyShare}>
                Copy share text
              </Button>
            </Card>

            <Card className="p-5 space-y-3 border-dashed">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Monthly tracking</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Turn this snapshot into a live KPI with monthly runs and trend reports.
              </p>
              <Button size="sm" className="w-full" disabled>Get monthly tracking</Button>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Engine breakdown</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground">ChatGPT</p>
              <p className="text-2xl font-semibold">{result.chatgptScore ?? "–"}/100</p>
            </Card>
            <Card className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Claude</p>
              <p className="text-2xl font-semibold">{result.claudeScore ?? "–"}/100</p>
            </Card>
            <Card className="p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Perplexity</p>
              <p className="text-2xl font-semibold">{result.perplexityScore ?? "–"}/100</p>
            </Card>
          </div>
        </section>

        <section className="text-center pt-8 border-t">
          <Link to="/methodology" className="text-primary hover:underline text-sm font-medium">
            How did we calculate this? See our methodology →
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Results;
