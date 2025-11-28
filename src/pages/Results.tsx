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
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, Copy, Check, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { analytics } from "@/utils/analytics";

// Mock data for development
const MOCK_DATA = {
  score: 68,
  grade: "C",
  gradeLabel: "Good",
  categories: [
    { name: "Answer Structure", score: 18, max: 30, percentage: 60 },
    { name: "Scannability", score: 14, max: 25, percentage: 56 },
    { name: "FAQ & Schema", score: 6, max: 20, percentage: 30 },
    { name: "Expertise Signals", score: 12, max: 15, percentage: 80 },
    { name: "Technical SEO", score: 8, max: 10, percentage: 80 },
  ],
  recommendations: [
    {
      id: "1",
      priority: "critical",
      title: "Missing direct answer at top",
      pointsLost: -10,
      problem: "AI search engines look for immediate, clear answers in the first 100 words. Your content doesn't provide this.",
      howToFix: [
        "Add a 2-3 sentence answer immediately after your H1",
        "Use plain language, not marketing speak",
        "Front-load the most important information",
      ],
      codeExample: `<article>
  <h1>What is AI Visibility?</h1>
  <p><strong>Direct Answer:</strong> AI visibility is how easily AI search engines like ChatGPT, Perplexity, and Google SGE can find, understand, and recommend your content to users.</p>
  <!-- Rest of content -->
</article>`,
      expectedImprovement: "+8-10 points",
    },
    {
      id: "2",
      priority: "critical",
      title: "No FAQ schema markup",
      pointsLost: -8,
      problem: "FAQ schema helps AI understand your Q&A structure and increases chances of being featured.",
      howToFix: [
        "Identify common questions in your content",
        "Format them with clear Q&A structure",
        "Add JSON-LD schema markup",
      ],
      codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is AI visibility?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "AI visibility is how easily AI search engines can find and recommend your content."
    }
  }]
}
</script>`,
      expectedImprovement: "+6-8 points",
    },
    {
      id: "3",
      priority: "critical",
      title: "Poor heading hierarchy",
      pointsLost: -7,
      problem: "Your headings skip levels (H1 to H3) and don't clearly outline your content structure.",
      howToFix: [
        "Use only one H1 (page title)",
        "Use H2 for main sections",
        "Use H3 for subsections under H2",
        "Never skip heading levels",
      ],
      codeExample: `<h1>Main Topic</h1>
<h2>First Main Section</h2>
<h3>Subsection</h3>
<h3>Another Subsection</h3>
<h2>Second Main Section</h2>`,
      expectedImprovement: "+5-7 points",
    },
    {
      id: "4",
      priority: "medium",
      title: "Long paragraphs hurt scannability",
      pointsLost: -5,
      problem: "Paragraphs over 4 lines are hard for AI to extract key points from.",
      howToFix: [
        "Break long paragraphs into 2-3 sentences each",
        "Use bullet points for lists",
        "Add clear topic sentences",
      ],
      codeExample: `<!-- Bad -->
<p>This is a very long paragraph that goes on and on with multiple ideas and makes it hard for both humans and AI to scan and understand the key points...</p>

<!-- Good -->
<p>Keep paragraphs short and focused on one idea.</p>
<p>Use bullet points when listing multiple items:</p>
<ul>
  <li>Point one</li>
  <li>Point two</li>
</ul>`,
      expectedImprovement: "+4-5 points",
    },
    {
      id: "5",
      priority: "medium",
      title: "Missing author/expert credentials",
      pointsLost: -4,
      problem: "AI gives more weight to content from verified experts.",
      howToFix: [
        "Add author bio with credentials",
        "Include author schema markup",
        "Link to author's LinkedIn or portfolio",
      ],
      codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "Jane Smith",
    "jobTitle": "Senior AI Researcher",
    "url": "https://linkedin.com/in/janesmith"
  }
}
</script>`,
      expectedImprovement: "+3-4 points",
    },
    {
      id: "6",
      priority: "medium",
      title: "No internal links to related content",
      pointsLost: -3,
      problem: "Internal links help AI understand content relationships and topic authority.",
      howToFix: [
        "Link to 2-3 related articles",
        "Use descriptive anchor text",
        "Link early in the content",
      ],
      codeExample: `<p>Learn more about <a href="/seo-basics">SEO fundamentals</a> and <a href="/content-strategy">content strategy</a>.</p>`,
      expectedImprovement: "+2-3 points",
    },
    {
      id: "7",
      priority: "medium",
      title: "Missing meta description",
      pointsLost: -3,
      problem: "Meta descriptions help AI understand page topic and context.",
      howToFix: [
        "Write a clear, concise summary (150-160 characters)",
        "Include primary keyword naturally",
        "Make it compelling and informative",
      ],
      codeExample: `<meta name="description" content="Learn how AI visibility impacts your content discovery. Get actionable strategies to rank in ChatGPT, Perplexity, and Google SGE.">`,
      expectedImprovement: "+2-3 points",
    },
    {
      id: "8",
      priority: "medium",
      title: "Weak call-to-action",
      pointsLost: -2,
      problem: "Your CTA is vague and doesn't guide users to next steps.",
      howToFix: [
        "Use specific, action-oriented language",
        "Make it prominent and clear",
        "Explain the benefit",
      ],
      codeExample: `<!-- Bad -->
<button>Click here</button>

<!-- Good -->
<button>Get Your Free AI Visibility Score →</button>`,
      expectedImprovement: "+1-2 points",
    },
    {
      id: "9",
      priority: "medium",
      title: "No publication/update date",
      pointsLost: -2,
      problem: "AI favors fresh, recently updated content.",
      howToFix: [
        "Add visible publication date",
        "Include last updated date",
        "Add Article schema with datePublished",
      ],
      codeExample: `<time datetime="2025-01-15">Published January 15, 2025</time>
<time datetime="2025-01-20">Last updated January 20, 2025</time>`,
      expectedImprovement: "+1-2 points",
    },
    {
      id: "10",
      priority: "good",
      title: "Good use of subheadings",
      pointsLost: 0,
      problem: "",
      howToFix: ["Keep using descriptive H2 and H3 tags", "Continue making them scannable"],
      codeExample: "",
      expectedImprovement: "",
    },
    {
      id: "11",
      priority: "good",
      title: "Page loads quickly",
      pointsLost: 0,
      problem: "",
      howToFix: ["Maintain fast load times", "Continue optimizing images"],
      codeExample: "",
      expectedImprovement: "",
    },
    {
      id: "12",
      priority: "good",
      title: "Mobile-responsive design",
      pointsLost: 0,
      problem: "",
      howToFix: ["Keep responsive design", "Test on various devices regularly"],
      codeExample: "",
      expectedImprovement: "",
    },
  ],
};

const getGradeInfo = (score: number) => {
  if (score >= 90) return { grade: "A", label: "Elite", color: "text-green-600" };
  if (score >= 80) return { grade: "B", label: "Excellent", color: "text-green-500" };
  if (score >= 70) return { grade: "C", label: "Good", color: "text-yellow-500" };
  if (score >= 60) return { grade: "D", label: "Needs Work", color: "text-orange-500" };
  return { grade: "F", label: "Critical", color: "text-red-600" };
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#10b981"; // green
  if (score >= 60) return "#f59e0b"; // yellow
  return "#ef4444"; // red
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
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">❌ CRITICAL</span>;
    case "medium":
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">⚠️ MEDIUM</span>;
    case "good":
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✅ DOING WELL</span>;
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
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 z-10"
        onClick={handleCopy}
      >
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
  const [showWrongTypeAlert, setShowWrongTypeAlert] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const url = searchParams.get("url") || "";
  const type = searchParams.get("type") || "homepage";

  useEffect(() => {
    analytics.pageView('results');
    
    // Simulate loading for demonstration
    setTimeout(() => setIsLoading(false), 1500);
    
    // Check localStorage for dismissed alert
    const dismissed = localStorage.getItem("wrongTypeAlertDismissed");
    if (!dismissed) {
      // Mock detection: randomly show wrong type for demo
      // In production, this would come from actual analysis
      const isWrongType = Math.random() > 0.7;
      setShowWrongTypeAlert(isWrongType);
    }
  }, []);

  const dismissAlert = () => {
    setShowWrongTypeAlert(false);
    localStorage.setItem("wrongTypeAlertDismissed", "true");
  };

  const switchTest = () => {
    const newType = type === "homepage" ? "blog" : "homepage";
    navigate(`/results?url=${encodeURIComponent(url)}&type=${newType}`);
  };

  const handleRetest = () => {
    navigate(`/?url=${encodeURIComponent(url)}&type=${type}`);
  };

  const handleFeedbackSubmit = () => {
    analytics.formSubmit('results_feedback');
    // In production, send to backend
    console.log("Feedback submitted:", { rating, feedback });
    alert("Thank you for your feedback!");
    setRating(0);
    setFeedback("");
  };

  const gradeInfo = getGradeInfo(MOCK_DATA.score);
  const scoreColor = getScoreColor(MOCK_DATA.score);

  // Loading skeleton
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-5xl" role="main">
        {/* Wrong Test Type Alert */}
        {showWrongTypeAlert && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" role="alert">
            <AlertCircle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-sm">🔍 We detected this is a {type === "homepage" ? "BLOG POST" : "HOMEPAGE"}. For accurate analysis, use the {type === "homepage" ? "Blog Post" : "Homepage"} Audit box.</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button size="sm" variant="outline" onClick={switchTest} className="flex-1 sm:flex-none">
                  Switch Test
                </Button>
                <Button size="sm" variant="ghost" onClick={dismissAlert} className="flex-1 sm:flex-none">
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Beta Access Banner */}
        <Alert className="mb-6 md:mb-8 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" role="status">
          <AlertDescription className="text-sm md:text-base text-green-800 dark:text-green-300 font-medium">
            🎉 BETA ACCESS: All features unlocked during free beta
          </AlertDescription>
        </Alert>

        {/* FI Score Display */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-block w-48 h-48 md:w-64 md:h-64 mb-4 md:mb-6">
            <CircularProgressbar
              value={MOCK_DATA.score}
              text={`${MOCK_DATA.score}`}
              styles={buildStyles({
                textSize: "28px",
                pathColor: scoreColor,
                textColor: scoreColor,
                trailColor: "#e5e7eb",
              })}
              aria-label={`FI Score: ${MOCK_DATA.score} out of 100`}
            />
          </div>
          <div className="space-y-2">
            <div className={`text-2xl md:text-3xl font-bold ${gradeInfo.color}`}>
              Grade: {gradeInfo.grade} ({gradeInfo.label})
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Confidence range: ±4 points</p>
          </div>
        </div>

        {/* Analysis Info */}
        <div className="text-center mb-6 md:mb-8">
          <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            EVALUATED ACROSS 18 CORE CRITERIA
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            Analyzing structure, content, and technical SEO
          </p>
        </div>

        {/* Category Breakdown */}
        <Card className="mb-6 md:mb-8">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {MOCK_DATA.categories.map((category, index) => {
              const color = category.percentage >= 70 ? "bg-green-500" : category.percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="text-muted-foreground">
                        {category.score}/{category.max}
                      </span>
                      <span className="font-semibold w-10 md:w-12 text-right">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={category.percentage} aria-valuemin={0} aria-valuemax={100}>
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

        {/* Industry Comparison */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {MOCK_DATA.categories.map((category, index) => {
              const color = category.percentage >= 70 ? "bg-green-500" : category.percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {category.score}/{category.max}
                      </span>
                      <span className="font-semibold w-12 text-right">
                        {category.percentage}%
                      </span>
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

        {/* Industry Comparison */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Industry Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Your FI Score:</span>
                <span className="text-2xl font-bold">{MOCK_DATA.score}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Industry Average:</span>
                <span className="text-2xl font-bold">62</span>
              </div>
              <div className="pt-4">
                {MOCK_DATA.score > 62 ? (
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    You're scoring ABOVE average 🎯
                  </p>
                ) : (
                  <p className="text-orange-600 dark:text-orange-400 font-semibold">
                    You're scoring BELOW average. Let's improve!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📋 ALL RECOMMENDATIONS</CardTitle>
            <CardDescription>
              Beta perk: Full audit normally costs $27-97
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {MOCK_DATA.recommendations.map((rec) => (
                <AccordionItem key={rec.id} value={rec.id}>
                  <AccordionTrigger>
                    <div className="flex items-start gap-3 text-left w-full">
                      {getPriorityIcon(rec.priority)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getPriorityBadge(rec.priority)}
                          <span className="font-semibold">{rec.title}</span>
                          {rec.pointsLost < 0 && (
                            <span className="text-red-600 dark:text-red-400 text-sm">
                              ({rec.pointsLost} pts)
                            </span>
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
                      {rec.howToFix.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1">How to fix:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {rec.howToFix.map((step, i) => (
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

        {/* Feedback Card */}
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
            <div>
              <Textarea
                placeholder="What would make this more valuable?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleFeedbackSubmit} className="w-full">
              Submit Feedback
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Your feedback helps us improve for launch
            </p>
          </CardContent>
        </Card>

        {/* Retest CTA */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>🔄 IMPLEMENT & RETEST</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Make the changes above, then check your new score</p>
            <Button onClick={handleRetest} className="w-full min-h-[48px]" size="lg">
              Retest This URL
            </Button>
          </CardContent>
        </Card>

        {/* Service Upsell */}
        <Card className="border-2 border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/20">
          <CardHeader>
            <CardTitle>💼 Need help implementing?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Limited beta slots: We'll optimize one page for FREE</p>
            <Button variant="outline" className="w-full min-h-[48px]" size="lg">
              Apply for Free Service
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
