import { useEffect, useState } from "react";
import { useSearchParams, Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Lightbulb,
  FileText,
  Target,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FeedbackModal } from "@/components/results/FeedbackModal";
import ScoreGauge from "@/components/results/ScoreGauge";
import CategoryBreakdown from "@/components/results/CategoryBreakdown";
import { getRemainingTests } from "@/utils/rateLimiting";
import Footer from "@/components/landing/Footer";
import Header from "@/components/layout/Header";

// Generate proportional sub-scores from main category score
const generateSubScores = (categoryScore: number, maxScore: number, breakdown: { label: string; max: number; description?: string }[]) => {
  const ratio = (categoryScore ?? 0) / maxScore;
  
  return breakdown.map((item) => ({
    label: item.label,
    score: Math.round(item.max * ratio),
    max: item.max,
    description: item.description,
  }));
};

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
  const location = useLocation();
  const testId = searchParams.get("testId");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proEmail, setProEmail] = useState("");
  const [isSubmittingProInterest, setIsSubmittingProInterest] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [testsRemaining, setTestsRemaining] = useState(10);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // Store current results URL in sessionStorage for navigation back from methodology
  useEffect(() => {
    if (testId) {
      sessionStorage.setItem('foundindex_results_url', location.pathname + location.search);
    }
  }, [testId, location]);

  useEffect(() => {
    const remaining = getRemainingTests();
    setTestsRemaining(remaining);

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
      toast.error("Couldn't save email. Please try again.");
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
            <p>Calculating your score...</p>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Usually takes 2-3 minutes</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <Card className="max-w-md w-full p-8 text-center space-y-4">
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <h1 className="text-xl font-semibold">Couldn&apos;t load results</h1>
            <p className="text-sm text-muted-foreground">{error ?? "Something went wrong"}</p>
            <Button asChild>
              <Link to="/">Run new test</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const score = result.foundIndexScore ?? 0;

  // Category configurations with sub-score breakdowns and descriptions
  const categoryConfigs = [
    {
      label: "Content Clarity",
      score: result.contentClarityScore ?? 0,
      max: 30,
      tooltip: "How clearly your homepage explains what you do, for whom, and why it matters",
      subBreakdown: [
        { label: "Value proposition clarity", max: 10, description: "Can AI identify what you do?" },
        { label: "Target audience specification", max: 8, description: "Can AI identify who you serve?" },
        { label: "Service/product specificity", max: 8, description: "Can AI explain your offering?" },
        { label: "Concrete evidence & examples", max: 4, description: "Are there specific results/examples?" },
      ],
    },
    {
      label: "Discoverability",
      score: result.discoverabilityScore ?? 0,
      max: 25,
      tooltip: "How easily AI systems can extract and understand key information from your page structure",
      subBreakdown: [
        { label: "Clear section structure", max: 10, description: "Well-organized content sections?" },
        { label: "Scannable headings", max: 8, description: "Descriptive headers that guide AI?" },
        { label: "Visual hierarchy", max: 7, description: "Clear content priority/flow?" },
      ],
    },
    {
      label: "Authority Signals",
      score: result.authorityScore ?? 0,
      max: 15,
      tooltip: "Credibility markers like case studies, testimonials, client logos, and expert credentials",
      subBreakdown: [
        { label: "Credibility markers", max: 8, description: "Case studies, results, credentials?" },
        { label: "Social proof elements", max: 7, description: "Testimonials, logos, reviews?" },
      ],
    },
    {
      label: "Technical Structure",
      score: result.structuredDataScore ?? 0,
      max: 15,
      tooltip: "Meta descriptions, headers, and navigation that help AI understand your content",
      subBreakdown: [
        { label: "Meta descriptions", max: 5, description: "Clear page descriptions for AI?" },
        { label: "Header optimization", max: 5, description: "Structured H1/H2/H3 hierarchy?" },
        { label: "Navigation clarity", max: 5, description: "Easy to understand site structure?" },
      ],
    },
    {
      label: "Competitive Positioning",
      score: result.comparisonScore ?? 0,
      max: 15,
      tooltip: "How clearly you differentiate yourself and provide comparison context",
      subBreakdown: [
        { label: "Differentiation clarity", max: 10, description: "What makes you different/unique?" },
        { label: "Comparison context", max: 5, description: "Context vs alternatives/competitors?" },
      ],
    },
  ];

  const recommendationIcons = [Lightbulb, FileText, Target];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Session Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Results expire when you close this page. <strong>Take a screenshot to save.</strong>
            </p>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>›</span>
          <span className="text-foreground">Results for {result.website || 'your website'}</span>
        </nav>

        {/* Test Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {result.website && <Badge variant="outline" className="text-xs">{result.website}</Badge>}
          </div>
          <span className="text-sm text-muted-foreground">
            Tests remaining: {testsRemaining}/10 this week
          </span>
        </div>

        {/* BENTO BOX LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Score Card with Speedometer */}
          <Card className="p-6 flex items-center justify-center">
            <ScoreGauge score={score} size={300} />
          </Card>

          {/* Category Breakdown with Expandable Sub-scores */}
          <Card className="p-6">
            {/* Prominent instruction text */}
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <p className="text-base font-semibold text-primary">
                Your score is based on 13+ detailed factors across 5 categories.
              </p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                👇 Click any category below to see the breakdown
              </p>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Category Breakdown</h2>
            </div>
            <div className="space-y-4">
              {categoryConfigs.map((config, i) => (
                <CategoryBreakdown
                  key={i}
                  label={config.label}
                  score={config.score}
                  max={config.max}
                  tooltip={config.tooltip}
                  subScores={generateSubScores(config.score, config.max, config.subBreakdown)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* What to Fix First - Full Width */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">What to fix first</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {(result.recommendations ?? []).length > 0 ? (
              (result.recommendations ?? []).slice(0, 3).map((rec, i) => {
                const Icon = recommendationIcons[i] || Lightbulb;
                return (
                  <div key={i} className="rounded-xl border bg-card p-5 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">+5–8 pts</Badge>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{rec}</p>
                    <p className="text-xs text-muted-foreground">
                      Helps AI models recommend your site more confidently.
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 rounded-xl border bg-card p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Great score! Your site is well-optimized for AI readability.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* CTA Section */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-xl font-semibold">Get expert help improving your score</h2>
            <p className="text-sm text-muted-foreground">
              Share 60-second feedback to receive detailed rewrite recommendations via email
            </p>
            <Button
              size="lg"
              className="h-auto py-4 px-8"
              onClick={() => setShowFeedbackModal(true)}
            >
              <span className="font-semibold">Request personalized strategy →</span>
            </Button>
            <p className="text-xs text-muted-foreground">
              Personalized homepage rewrite strategy delivered within 48 hours
            </p>
          </div>
        </Card>

        {/* Collapsible Methodology Section */}
        <Collapsible open={methodologyOpen} onOpenChange={setMethodologyOpen}>
          <Card className="p-6 bg-muted/30 border-dashed">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">How we calculate this score</h2>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${methodologyOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                We analyze how AI systems like ChatGPT would describe your business:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
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
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">About this analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  FoundIndex is a v1 diagnostic tool. We analyze your homepage only (multi-page analysis coming in v2). 
                  Scores may vary ±5-10 points between tests—this is normal with AI-powered analysis.
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">What this doesn't measure</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Actual AI recommendation frequency</li>
                  <li>• Overall marketing effectiveness</li>
                  <li>• Traditional SEO rankings</li>
                  <li>• Brand awareness outside your website</li>
                </ul>
              </div>

              <div className="pt-4">
                <Link to="/methodology" className="text-link hover:underline text-sm font-medium">
                  Read full methodology →
                </Link>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </main>

      {/* Bottom CTA Section */}
      <section className="py-12 px-4 bg-accent-gray-light border-t">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-2xl font-semibold">Increase your AI visibility</h2>
          <p className="text-muted-foreground">
            Get detailed homepage evaluation with specific, actionable recommendations.
          </p>
          <div className="space-y-3 max-w-md mx-auto text-left">
            <p className="text-sm text-muted-foreground">
              Submit feedback (60 seconds) to receive:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Personalized homepage rewrite strategy (within 48 hours)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Bonus: <strong>One</strong> blog post diagnostic (in exchange for LinkedIn review)</span>
              </li>
            </ul>
          </div>
          <Button
            size="lg"
            className="h-auto py-4 px-8"
            onClick={() => setShowFeedbackModal(true)}
          >
            <span className="font-semibold">Request personalized strategy</span>
          </Button>
        </div>
      </section>

      {/* Pro Modal */}
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
                <p className="text-sm text-muted-foreground">See how your AI visibility improves</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1">🎯</div>
              <div>
                <p className="font-medium">Competitor tracking</p>
                <p className="text-sm text-muted-foreground">Compare against competitors</p>
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

      <Footer />
    </div>
  );
};

export default Results;
