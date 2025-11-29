import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Share2,
  Download,
  Home,
  FileText,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { analytics } from "@/utils/analytics";
import { supabase } from "@/integrations/supabase/client";

// =============================================================================
// HELPERS
// =============================================================================

const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
};

type CategorySummary = {
  name: string;
  key: string;
  score: number;
  max: number;
  percentage: number;
  details?: any;
  breakdown?: any;
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
  testType: "homepage" | "blog";
  categories: CategorySummary[];
  recommendations: Recommendation[];
  criteriaCount: number;
};

const getGradeInfo = (score: number) => {
  if (score >= 90) return { grade: "A", label: "Elite", color: "text-green-600", bgColor: "bg-green-500" };
  if (score >= 80) return { grade: "B", label: "Strong", color: "text-green-500", bgColor: "bg-green-400" };
  if (score >= 70) return { grade: "C", label: "Average", color: "text-yellow-500", bgColor: "bg-yellow-400" };
  if (score >= 60) return { grade: "D", label: "Weak", color: "text-orange-500", bgColor: "bg-orange-400" };
  return { grade: "F", label: "Critical", color: "text-red-600", bgColor: "bg-red-500" };
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

const getCategoryDisplayName = (key: string): string => {
  const names: Record<string, string> = {
    schemaMarkup: "Schema markup",
    semanticStructure: "Semantic structure",
    technicalFoundation: "Technical foundation",
    images: "Image optimization",
    contentClarity: "Content clarity",
    answerStructure: "Answer structure",
    authoritySignals: "Authority signals",
    scannability: "Scannability",
    expertiseSignals: "Expertise signals",
    faqSchema: "FAQ & schema",
    technicalSEO: "Technical SEO",
  };
  return names[key] || key;
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
          Critical
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          Medium
        </span>
      );
    case "good":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Good
        </span>
      );
    default:
      return null;
  }
};

// =============================================================================
// SPEEDOMETER GAUGE COMPONENT
// =============================================================================

const SpeedometerGauge = ({ score }: { score: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height - 40;
    const radius = Math.min(width, height) - 60;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background arc (gray)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = 30;
    ctx.strokeStyle = "#e5e7eb";
    ctx.stroke();

    // Draw colored segments
    const segments = [
      { start: 0, end: 0.4, color: "#ef4444" }, // Red: 0-40
      { start: 0.4, end: 0.6, color: "#f59e0b" }, // Orange: 40-60
      { start: 0.6, end: 0.7, color: "#eab308" }, // Yellow: 60-70
      { start: 0.7, end: 0.8, color: "#84cc16" }, // Light green: 70-80
      { start: 0.8, end: 1, color: "#10b981" }, // Green: 80-100
    ];

    for (const segment of segments) {
      const startAngle = Math.PI + segment.start * Math.PI;
      const endAngle = Math.PI + segment.end * Math.PI;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      ctx.lineWidth = 30;
      ctx.strokeStyle = segment.color;
      ctx.stroke();
    }

    // Draw tick marks
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI + (i / 10) * Math.PI;
      const innerRadius = radius - 20;
      const outerRadius = radius + 20;

      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = i % 5 === 0 ? 3 : 1;
      ctx.strokeStyle = "#6b7280";
      ctx.stroke();

      // Draw numbers at major ticks
      if (i % 2 === 0) {
        const textRadius = radius + 40;
        const textX = centerX + Math.cos(angle) * textRadius;
        const textY = centerY + Math.sin(angle) * textRadius;
        // FIX: Use system-ui font for better cross-platform support
        ctx.font = "14px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((i * 10).toString(), textX, textY);
      }
    }

    // Draw needle
    const needleAngle = Math.PI + (score / 100) * Math.PI;
    const needleLength = radius - 40;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(needleAngle - Math.PI / 2);

    // Needle body
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(0, -needleLength);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fillStyle = "#1f2937";
    ctx.fill();

    // Needle center circle
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, 2 * Math.PI);
    ctx.fillStyle = "#1f2937";
    ctx.fill();

    ctx.restore();
  }, [score]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={400} height={250} className="mx-auto max-w-full" />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-5xl font-bold" style={{ color: getScoreColor(score) }}>
          {score}
        </div>
        <div className="text-sm text-muted-foreground">out of 100</div>
      </div>
    </div>
  );
};

// =============================================================================
// CODE BLOCK COMPONENT
// =============================================================================

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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [website, setWebsite] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shareTooltip, setShareTooltip] = useState(false);

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
          setLoadError("No results found. Please run a new analysis.");
          return;
        }

        const categoriesSource = (data as any).categories || {};
        const testType = (data as any).test_type || "homepage";

        // Build categories array from whatever structure we have
        const categories: CategorySummary[] = [];

        for (const [key, value] of Object.entries(categoriesSource)) {
          if (value && typeof value === "object") {
            const cat = value as any;
            categories.push({
              name: getCategoryDisplayName(key),
              key,
              score: cat.score ?? 0,
              max: cat.max ?? 0,
              percentage: cat.percentage ?? Math.round(((cat.score || 0) / (cat.max || 1)) * 100),
              details: cat.details,
              breakdown: cat.breakdown,
            });
          }
        }

        // Sort: deterministic categories first, then AI categories
        const deterministicKeys = ["schemaMarkup", "semanticStructure", "technicalFoundation", "images"];
        categories.sort((a, b) => {
          const aIsDet = deterministicKeys.includes(a.key) ? 0 : 1;
          const bIsDet = deterministicKeys.includes(b.key) ? 0 : 1;
          return aIsDet - bIsDet;
        });

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
            testType,
            categories,
            recommendations,
            criteriaCount: testType === "homepage" ? 47 : 52,
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

  const handleRetest = () => navigate("/");

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `My website scored ${resultData?.score}/100 on FoundIndex AI visibility test. Check your site: foundindex.com`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "My FoundIndex score", text: shareText, url: shareUrl });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareTooltip(true);
      setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    const report = `
FOUNDINDEX AI VISIBILITY REPORT
================================
Website: ${website}
Test type: ${resultData?.testType === "homepage" ? "Homepage" : "Blog post"}
Score: ${resultData?.score}/100
Grade: ${resultData?.grade} (${resultData?.gradeLabel})
Criteria analyzed: ${resultData?.criteriaCount}

CATEGORY BREAKDOWN
------------------
${resultData?.categories.map((c) => `${c.name}: ${c.score}/${c.max} (${c.percentage}%)`).join("\n")}

TOP RECOMMENDATIONS
-------------------
${resultData?.recommendations
  .filter((r) => r.priority === "critical")
  .slice(0, 5)
  .map((r) => `• ${r.title}: ${r.problem}`)
  .join("\n")}

Generated by FoundIndex.com
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `foundindex-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleFeedbackSubmit = () => {
    analytics.formSubmit("results_feedback");
    console.log("Feedback submitted:", { rating, feedback });
    alert("Thank you for your feedback!");
    setRating(0);
    setFeedback("");
  };

  const gradeInfo = getGradeInfo(resultData?.score ?? 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="space-y-8">
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-center">
              <Skeleton className="h-64 w-96" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (loadError || !resultData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError || "No results available. Please start a new test."}</AlertDescription>
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
        {/* Page type badge and URL */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            {resultData.testType === "homepage" ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Home className="h-4 w-4" />
                Homepage analysis
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                <FileText className="h-4 w-4" />
                Blog post analysis
              </span>
            )}
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Results for: <span className="font-semibold break-all">{website}</span>
          </p>
        </div>

        {/* Beta banner */}
        <Alert className="mb-6 md:mb-8 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription className="text-sm md:text-base text-green-800 dark:text-green-300 font-medium">
            🎉 Beta access: All features unlocked free
          </AlertDescription>
        </Alert>

        {/* Speedometer gauge */}
        <div className="text-center mb-8 md:mb-12">
          <SpeedometerGauge score={resultData.score} />

          <div className="mt-4 space-y-2">
            <div className={`text-2xl md:text-3xl font-bold ${gradeInfo.color}`}>
              Grade: {gradeInfo.grade} ({gradeInfo.label})
            </div>
            <p className="text-sm text-muted-foreground">
              Analyzed {resultData.criteriaCount} criteria across {resultData.categories.length} categories
            </p>
          </div>

          {/* Share and download buttons */}
          <div className="flex justify-center gap-3 mt-6">
            <div className="relative">
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share results
              </Button>
              {shareTooltip && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-foreground text-background rounded">
                  Copied!
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-2">
              <Download className="h-4 w-4" />
              Download report
            </Button>
          </div>
        </div>

        {/* Category breakdown */}
        <Card className="mb-8 md:mb-16">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Category breakdown</CardTitle>
            <CardDescription>
              {resultData.testType === "homepage"
                ? "How well your homepage signals business clarity to AI"
                : "How well your blog post answers questions for AI"}
            </CardDescription>
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

                  {/* Schema breakdown details */}
                  {category.key === "schemaMarkup" && category.breakdown && (
                    <div className="mt-2 pl-4 text-xs text-muted-foreground">
                      <p className="mb-1">{category.breakdown.summary}</p>
                      {category.breakdown.scores && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {category.breakdown.scores.slice(0, 4).map((s: any, i: number) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded ${s.found ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                            >
                              {s.category}: {s.found ? "✓" : "✗"}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Industry comparison */}
        <Card className="mb-16 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📊 Industry comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Your FI score:</span>
                <span className="text-2xl font-bold">{resultData.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Industry average:</span>
                <span className="text-2xl font-bold">58</span>
              </div>
              <div className="pt-4">
                {resultData.score > 58 ? (
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    You're {resultData.score - 58} points above average 🎯
                  </p>
                ) : (
                  <p className="text-orange-600 dark:text-orange-400 font-semibold">
                    You're {58 - resultData.score} points below average. Let's fix that.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>📋 All recommendations</CardTitle>
            <CardDescription>
              {resultData.recommendations.filter((r) => r.priority === "critical").length} critical issues found
            </CardDescription>
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

        {/* Feedback */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>💬 Help us improve</CardTitle>
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
              Submit feedback
            </Button>
          </CardContent>
        </Card>

        {/* Retest CTA */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>🔄 Implement and retest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Make the changes above, then check your new score</p>
            <Button onClick={handleRetest} className="w-full min-h-[48px]" size="lg">
              Test another URL
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
