import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, Copy, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import { analytics } from "@/utils/analytics";
import { supabase } from "@/integrations/supabase/client";

// ✅ SAFE ARRAY HELPER - Prevents crashes from string/array mismatch
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
};

type CategorySummary = {
  name: string;
  score: number;
  max: number;
  percentage: number;
};

type Recommendation = {
  id: string;
  priority: string;
  title: string;
  pointsLost: number;
  problem: string;
  howToFix: string[] | string;
  codeExample: string;
  expectedImprovement: string;
};

type ResultData = {
  score: number;
  grade: string;
  gradeLabel: string;
  categories: CategorySummary[];
  recommendations: Recommendation[];
};

const getGradeInfo = (score: number) => {
  if (score >= 90) return { grade: "A", label: "Elite", color: "text-green-600" };
  if (score >= 80) return { grade: "B", label: "Excellent", color: "text-green-500" };
  if (score >= 70) return { grade: "C", label: "Good", color: "text-yellow-500" };
  if (score >= 60) return { grade: "D", label: "Needs Work", color: "text-orange-500" };
  return { grade: "F", label: "Critical", color: "text-red-600" };
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "critical":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "medium":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case "good":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    default:
      return <AlertCircle className="h-5 w-5" />;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          ❌ CRITICAL
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          ⚠️ MEDIUM
        </span>
      );
    case "good":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          ✅ DOING WELL
        </span>
      );
    default:
      return null;
  }
};

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-2">
      <Button size="sm" variant="ghost" className="absolute top-2 right-2 z-10" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [website, setWebsite] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const url = searchParams.get("url") || "";
  const testId = searchParams.get("testId");

  useEffect(() => {
    analytics.pageView("results");

    if (url) setWebsite(url);

    if (!testId) {
      setLoadError("Missing test ID. Please start a new test from the homepage.");
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadResults = async () => {
      try {
        const { data, error } = await supabase.from("test_history").select("*").eq("test_id", testId).maybeSingle();

        if (error) throw error;

        if (!data) {
          setLoadError("No results found for this test. Please run a new analysis.");
          return;
        }

        const categoriesSource = (data as any).categories || {};
        const categories: CategorySummary[] = [
          {
            name: "Answer Structure",
            score: categoriesSource.answerStructure?.score ?? 0,
            max: categoriesSource.answerStructure?.max ?? 30,
            percentage: categoriesSource.answerStructure?.percentage ?? 0,
          },
          {
            name: "Scannability",
            score: categoriesSource.scannability?.score ?? 0,
            max: categoriesSource.scannability?.max ?? 25,
            percentage: categoriesSource.scannability?.percentage ?? 0,
          },
          {
            name: "FAQ & Schema",
            score: categoriesSource.faqSchema?.score ?? 0,
            max: categoriesSource.faqSchema?.max ?? 20,
            percentage: categoriesSource.faqSchema?.percentage ?? 0,
          },
          {
            name: "Expertise Signals",
            score: categoriesSource.expertiseSignals?.score ?? 0,
            max: categoriesSource.expertiseSignals?.max ?? 15,
            percentage: categoriesSource.expertiseSignals?.percentage ?? 0,
          },
          {
            name: "Technical SEO",
            score: categoriesSource.technicalSEO?.score ?? 0,
            max: categoriesSource.technicalSEO?.max ?? 10,
            percentage: categoriesSource.technicalSEO?.percentage ?? 0,
          },
        ];

        const score = (data as any).score ?? 0;
        const gradeMeta = getGradeInfo(score);
        const recommendations = ((data as any).recommendations || []).map((rec: any, idx: number) => ({
          ...rec,
          id: rec.id || `rec-${idx}`,
        })) as Recommendation[];

        if (!isCancelled) {
          setResultData({
            score,
            grade: gradeMeta.grade,
            gradeLabel: gradeMeta.label,
            categories,
            recommendations,
          });
          setWebsite((data as any).website || url);
        }
      } catch (error) {
        console.error("[Results] Failed to load results", error);
        if (!isCancelled) {
          setLoadError("Unable to load results. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadResults();

    return () => {
      isCancelled = true;
    };
  }, [testId, url]);

  const handleRetest = () => {
    navigate("/");
  };

  const handleFeedbackSubmit = () => {
    analytics.formSubmit("results_feedback");
    console.log("Feedback submitted:", { rating, feedback });
    alert("Thank you for your feedback!");
    setRating(0);
    setFeedback("");
  };

  const gradeInfo = getGradeInfo(resultData?.score ?? 0);
  const scoreColor = getScoreColor(resultData?.score ?? 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="space-y-8">
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-center">
              <Skeleton className="h-64 w-64 rounded-full" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (loadError || !resultData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {loadError || "No results available. Please start a new test from the homepage."}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/")} className="w-full md:w-auto min-h-[48px]">
            Back to homepage
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <p className="text-sm md:text-base text-muted-foreground">
            Analysis results for: <span className="font-semibold break-all">{website}</span>
          </p>
        </div>

        <Alert className="mb-6 md:mb-8 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription className="text-sm md:text-base text-green-800 dark:text-green-300 font-medium">
            🎉 BETA ACCESS: All features unlocked during free beta
          </AlertDescription>
        </Alert>

        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block w-48 h-48 md:w-64 md:h-64 mb-4 md:mb-6">
            <CircularProgressbar
              value={resultData.score}
              text={`${resultData.score}`}
              styles={buildStyles({
                textSize: "28px",
                pathColor: scoreColor,
                textColor: scoreColor,
                trailColor: "#e5e7eb",
              })}
            />
          </div>
          <div className="space-y-2">
            <div className={`text-2xl md:text-3xl font-bold ${gradeInfo.color}`}>
              Grade: {gradeInfo.grade} ({gradeInfo.label})
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Confidence range: ±10 points</p>
          </div>
        </div>

        <Card className="mb-8 md:mb-16">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Category breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8">
            {resultData.categories.map((category, index) => {
              const color =
                category.percentage >= 70 ? "bg-green-500" : category.percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="text-muted-foreground">
                        {category.score}/{category.max}
                      </span>
                      <span className="font-semibold w-10 md:w-12 text-right">{category.percentage}%</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${color} transition-all duration-500`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="mb-16 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📊 Industry comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Your FI Score:</span>
                <span className="text-2xl font-bold">{resultData.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Industry Average:</span>
                <span className="text-2xl font-bold">62</span>
              </div>
              <div className="pt-4">
                {resultData.score > 62 ? (
                  <p className="text-green-600 dark:text-green-400 font-semibold">You're scoring ABOVE average 🎯</p>
                ) : (
                  <p className="text-orange-600 dark:text-orange-400 font-semibold">
                    You're scoring BELOW average. Let's improve!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-16">
          <CardHeader>
            <CardTitle>📋 All recommendations</CardTitle>
            <CardDescription>Beta perk: Full audit normally costs $27-97</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {resultData.recommendations.map((rec) => (
                <AccordionItem key={rec.id} value={rec.id}>
                  <AccordionTrigger>
                    <div className="flex items-start gap-3 text-left w-full">
                      {getPriorityIcon(rec.priority)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getPriorityBadge(rec.priority)}
                          <span className="font-semibold">{rec.title}</span>
                          {rec.pointsLost < 0 && (
                            <span className="text-red-600 dark:text-red-400 text-sm">({rec.pointsLost} pts)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 space-y-4 pt-2">
                      {rec.problem && (
                        <div>
                          <h4 className="font-semibold mb-1">Problem:</h4>
                          <p className="text-sm text-muted-foreground">{rec.problem}</p>
                        </div>
                      )}
                      {rec.howToFix && ensureArray(rec.howToFix).length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1">How to fix:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {ensureArray(rec.howToFix).map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rec.codeExample && (
                        <div>
                          <h4 className="font-semibold mb-1">Code example:</h4>
                          <CodeBlock code={rec.codeExample} />
                        </div>
                      )}
                      {rec.expectedImprovement && (
                        <div>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            Expected improvement: {rec.expectedImprovement}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>💬 Help Us Improve</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-2">Rate this analysis:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="What would make this more valuable?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
            <Button onClick={handleFeedbackSubmit} className="w-full">
              Submit Feedback
            </Button>
            <p className="text-xs text-muted-foreground text-center">Your feedback helps us improve for launch</p>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>🔄 IMPLEMENT & RETEST</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Make the changes above, then check your new score</p>
            <Button onClick={handleRetest} className="w-full min-h-[48px]" size="lg">
              Test Another URL
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
