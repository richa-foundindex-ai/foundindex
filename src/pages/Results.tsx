import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Share2, Download } from "lucide-react";
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
  chatgptScore: number;
  claudeScore: number;
  perplexityScore: number;
  recommendationsCount: number;
  recommendationRate: number;
  website?: string;
  industry?: string;
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
        console.log('[Results] Fetching results for test ID:', testId);
        
        const { data, error: fetchError } = await supabase.functions.invoke('fetch-results', {
          body: { testId }
        });

        if (fetchError) {
          console.error('[Results] Error fetching results:', fetchError);
          throw new Error(fetchError.message);
        }

        if (data.error) {
          console.error('[Results] API returned error:', data.error);
          throw new Error(data.error);
        }

        console.log('[Results] Successfully fetched results:', data);
        setResult(data);
      } catch (err) {
        console.error('[Results] Failed to fetch results:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
        toast.error('Failed to load test results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Testing Your Website</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>Analyzing website structure...</p>
            <p>Generating buyer questions...</p>
            <p>Testing ChatGPT recommendations...</p>
            <p>Calculating FoundIndex...</p>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Usually 60-90 seconds
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {error === 'Test not found' ? 'Test Not Found' : 'Error Loading Results'}
          </h1>
          <p className="text-muted-foreground">
            {error || 'Unable to load test results. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-destructive";
    if (score < 50) return "text-amber-600";
    if (score < 70) return "text-blue-600";
    return "text-green-600";
  };

  const getScoreInterpretation = (score: number) => {
    if (score < 30) return "Low visibility - most AI-driven buyers won't discover you";
    if (score < 50) return "Emerging visibility - you're found occasionally but competitors dominate";
    if (score < 70) return "Strong visibility - AI recommends you regularly";
    return "Excellent visibility - you're a top recommendation";
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            Test Complete
          </Badge>
          <h1 className="text-4xl font-bold mb-2">Your FoundIndex Report</h1>
          <p className="text-muted-foreground">
            Results for: {result.website} • Industry: {result.industry} • Tested:{" "}
            {new Date(result.testDate || "").toLocaleDateString()}
          </p>
        </div>

        {/* Main Score Card */}
        <Card className="p-8 mb-8 border-2 border-primary">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your FoundIndex Score</h2>
            <div className={`text-8xl font-bold mb-4 ${getScoreColor(result.foundIndexScore)}`}>
              {result.foundIndexScore}
              <span className="text-4xl text-muted-foreground">/100</span>
            </div>
            <p className="text-xl mb-6">{getScoreInterpretation(result.foundIndexScore)}</p>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="font-semibold">
                Your score of {result.foundIndexScore} places you in the 62nd percentile of all
                SaaS companies tested.
              </p>
              <p className="text-muted-foreground">
                You rank 3rd out of 7 direct competitors in our database.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-sm text-muted-foreground">Queries tested</p>
                <p className="text-2xl font-bold">{result.queryResults?.length || 15}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommendations</p>
                <p className="text-2xl font-bold">{result.recommendationsCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(result.recommendationRate)}%
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-8 justify-center">
              <Button variant="default" className="bg-primary hover:bg-primary-hover">
                <Share2 className="mr-2 h-4 w-4" />
                Share Score
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </Card>

        {/* Engine Breakdown */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Engine Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">ChatGPT</span>
                <span className="font-bold text-primary">{result.foundIndexScore}/100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full"
                  style={{ width: `${result.foundIndexScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Recommended in {result.recommendationsCount} of {result.queryResults?.length || 15} queries
              </p>
            </div>
            <div className="opacity-50">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Claude</span>
                <span className="font-bold">Coming soon</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-muted-foreground h-3 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
            <div className="opacity-50">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Perplexity</span>
                <span className="font-bold">Coming soon</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div className="bg-muted-foreground h-3 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Query Sample */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Sample Query Results</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Query: "Best SaaS tools for remote collaboration"</p>
                  <p className="text-sm text-muted-foreground">Engine: ChatGPT • Status: Recommended</p>
                  <p className="text-sm mt-2">Position: 2nd of 6 recommendations</p>
                </div>
              </div>
            </div>
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex items-start gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Query: "Top collaboration platforms"</p>
                  <p className="text-sm text-muted-foreground">Engine: ChatGPT • Status: Not recommended</p>
                  <p className="text-sm mt-2 text-red-600">
                    Gap: Competitors have fresher content (updated &lt;30 days)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Improvement Roadmap */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your FoundIndex Improvement Plan</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary">HIGH IMPACT (Do This Week)</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-bold">1. Update Content Freshness</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Impact: +12-15 points | Effort: 4 hours
                  </p>
                  <p className="text-sm">
                    Content &lt;30 days old = 25.7% higher recommendations. Your last update: 67
                    days.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Expected:</strong> FoundIndex {result.foundIndexScore} → 59-62
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <p className="font-bold">2. Add FAQ Schema</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Impact: +10-12 points | Effort: 2 hours
                  </p>
                  <p className="text-sm">
                    FAQ schema = 45% visibility boost. You have 1 page, competitors have 5-8.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Expected:</strong> FoundIndex 59-62 → 69-74
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tracking CTA */}
        <Card className="p-8 border-2 border-primary bg-accent-red-light">
          <h2 className="text-2xl font-bold mb-4 text-center">Turn This Into a Trend</h2>
          <p className="text-center mb-6 text-muted-foreground">
            One test shows a snapshot. Monthly tracking shows whether you're improving or falling
            behind.
          </p>
          <div className="text-center">
            <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
              🔒 Start Tracking Your FoundIndex
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Pro: $49/mo (Weekly tracking, 3 competitors) | Business: $199/mo (Daily tracking,
              unlimited competitors)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Results;
