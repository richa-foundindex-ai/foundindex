import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Share2,
  Download,
  BarChart3,
  Target,
  Sparkles,
  Info,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FeedbackModal } from "@/components/results/FeedbackModal";
import { getRemainingTests } from "@/utils/rateLimiting";
import Footer from "@/components/landing/Footer";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proEmail, setProEmail] = useState("");
  const [isSubmittingProInterest, setIsSubmittingProInterest] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [testsUsed, setTestsUsed] = useState(0);
  const [testsRemaining, setTestsRemaining] = useState(3);

  useEffect(() => {
    // Update test counter
    const remaining = getRemainingTests();
    setTestsRemaining(remaining);
    setTestsUsed(999 - remaining);

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

        console.log("═══════════════════════════════════════");
        console.log("=== RESULTS PAGE - DATA RECEIVED ===");
        console.log("═══════════════════════════════════════");
        console.log("Full data object:", data);
        console.log("foundIndexScore:", data?.foundIndexScore);
        console.log("contentClarityScore:", data?.contentClarityScore);
        console.log("structuredDataScore:", data?.structuredDataScore);
        console.log("authorityScore:", data?.authorityScore);
        console.log("discoverabilityScore:", data?.discoverabilityScore);
        console.log("comparisonScore:", data?.comparisonScore);
        console.log("recommendations:", data?.recommendations);
        console.log("═══════════════════════════════════════");

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
    if (score <= 39) return "Minimal AI visibility. AI cannot comprehend your business offering. Immediate content restructure needed.";
    if (score <= 54) return "Poor AI visibility. AI systems decline to recommend or provide vague responses. Critical fixes required.";
    if (score <= 69) return "Moderate AI visibility. Key gaps block AI recommendations. Priority fixes identified below.";
    if (score <= 84) return "Strong AI visibility. Targeted improvements will increase recommendation frequency.";
    return "Excellent AI visibility. AI systems recommend your business confidently.";
  };


  const handleProInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proEmail || !proEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(proEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmittingProInterest(true);

    try {
      const { error } = await supabase.from("test_submissions").insert({
        test_id: `pro-interest-${Date.now()}`,
        email: proEmail.trim(),
      });

      if (error) throw error;

      toast.success("✓ You're on the v2 waitlist! We'll email you when it launches.");
      setProEmail("");
      setShowProModal(false);
    } catch (err) {
      console.error("Failed to save Pro interest:", err);
      toast.error(
        <span>
          Couldn't save email. Please try again or email us at{" "}
          <a href="mailto:hello@foundindex.com" className="underline cursor-pointer">
            hello@foundindex.com
          </a>
        </span>,
      );
    } finally {
      setIsSubmittingProInterest(false);
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
          <Button asChild>
            <Link to="/">Run new test</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const score = result.foundIndexScore ?? 0;

  return (
    <div className="min-h-screen bg-background/40">
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-4">
            {testsRemaining < 999 && (
              <span className="text-sm text-muted-foreground">Tests remaining: {testsRemaining}/3</span>
            )}
          </div>
        </div>

        <section className="space-y-8">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Tests remaining: {testsRemaining}/3
            </div>
            <h1 className="text-editorial-xl">Your AI visibility score</h1>
            <p className="text-editorial-sm text-muted-foreground">
              Measured across 5 AI-critical factors
            </p>
          </div>

          <Card className="p-6 bg-accent-gray-light border-none">
            <h2 className="text-xl font-semibold mb-4 text-foreground">How FoundIndex scored your site</h2>
            <p className="text-muted-foreground mb-4">
              We tested how AI systems like ChatGPT would describe your business:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Can they identify what you do?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Do they understand who you serve?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Can they explain why someone should choose you?</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">Your score reflects how clearly AI grasped these core details.</p>
          </Card>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {result.website && <Badge variant="outline">{result.website}</Badge>}
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
            <p className="text-sm text-muted-foreground">
              Better than {Math.round(Math.max(0, Math.min(100, ((score - 40) / 60) * 100)))}% of tested sites
            </p>
            <p className="text-sm font-medium">{getPercentile(score)}</p>
            <Progress value={score} className="h-2" />
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-semibold">Diagnostic breakdown</h2>
            {[
              { label: "Content clarity", sublabel: "Value proposition explicitness", score: result.contentClarityScore, max: 30 },
              { label: "Information discoverability", sublabel: "Key detail accessibility", score: result.discoverabilityScore, max: 25 },
              { label: "Authority signals", sublabel: "Credibility verification markers", score: result.authorityScore, max: 15 },
              { label: "Technical structure", sublabel: "Machine-readable optimization", score: result.structuredDataScore, max: 15 },
              { label: "Competitive positioning", sublabel: "Differentiation clarity", score: result.comparisonScore, max: 15 },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {item.sublabel}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.score ?? 0}/{item.max}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={((item.score ?? 0) / item.max) * 100} className="h-1.5 flex-1" />
                  {(item.score ?? 0) > item.max * 0.7 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </Card>
        </section>

        <Card className="p-6 bg-muted/30">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Results are only available during this session. Take a screenshot to save them.
            </p>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full max-w-md h-auto py-6"
            onClick={() => setShowFeedbackModal(true)}
          >
            <span className="font-semibold">Get detailed homepage evaluation (48-hour delivery)</span>
          </Button>
        </div>

        <Card className="p-6 space-y-4 bg-muted/30 border-dashed">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Analysis methodology</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FoundIndex v1 analyzes homepage content (multi-page diagnostic launches v2).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ±2 point score variance reflects AI analysis patterns—standard for machine learning systems.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Research-backed methodology. Validated against real websites. Updated based on proven outcomes.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Measurement scope</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              FoundIndex measures AI comprehension factors, not:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Real-time recommendation frequency (ChatGPT conversations are private)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Marketing ROI or conversion rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Google search rankings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Off-site brand recognition</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This diagnostic quantifies technical factors that determine AI recommendation likelihood.
            </p>
          </div>
        </Card>

        <section className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold">Priority fixes</h2>
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
                    Great score! Your site is already well-optimized for AI readability. Keep your content fresh and
                    continue building authority.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </section>


        <section className="text-center pt-8 border-t">
          <Button
            variant="link"
            className="text-primary hover:underline text-sm font-medium"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Back to results ↑
          </Button>
        </section>
      </main>

      <Dialog open={showProModal} onOpenChange={setShowProModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Monthly tracking coming soon! 🚀</DialogTitle>
            <DialogDescription className="text-base pt-2">We're building Pro features including:</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">✅</div>
              <div>
                <p className="font-medium">Monthly automated tests</p>
                <p className="text-sm text-muted-foreground">Track your score over time automatically</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">📊</div>
              <div>
                <p className="font-medium">Trend reports</p>
                <p className="text-sm text-muted-foreground">See how your AI visibility improves month over month</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">🎯</div>
              <div>
                <p className="font-medium">Competitor tracking</p>
                <p className="text-sm text-muted-foreground">Compare your score against competitors</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProInterestSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pro-email" className="text-sm font-medium">
                Want early access? Enter your email:
              </label>
              <Input
                id="pro-email"
                type="email"
                placeholder="your@email.com"
                value={proEmail}
                onChange={(e) => setProEmail(e.target.value)}
                disabled={isSubmittingProInterest}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmittingProInterest}>
              {isSubmittingProInterest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Notify me"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <FeedbackModal
        open={showFeedbackModal}
        onOpenChange={setShowFeedbackModal}
        testId={testId || ""}
        score={score}
        website={result.website || ""}
      />

      <section className="py-16 px-4 bg-accent-gray-light border-t">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-2xl font-semibold">Increase your AI visibility</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get detailed homepage evaluation with specific, actionable recommendations to improve your AI visibility score.
          </p>
          <div className="space-y-3 max-w-xl mx-auto text-left">
            <p className="text-sm text-muted-foreground">
              Submit feedback (60 seconds) to receive:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Personalized rewrite strategy (48-hour delivery)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Bonus: Blog post diagnostic (exchange: LinkedIn review)</span>
              </li>
            </ul>
          </div>
          <Button
            size="lg"
            className="w-full max-w-md mx-auto h-auto py-6"
            onClick={() => setShowFeedbackModal(true)}
          >
            <span className="font-semibold">Get Detailed Homepage Evaluation</span>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Results;
