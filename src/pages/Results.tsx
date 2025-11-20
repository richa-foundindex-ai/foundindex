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

  const handleShareScore = async () => {
    const shareUrl = window.location.href;
    const shareText = `🎯 I scored ${result.foundIndexScore}/100 on FoundIndex - the AI visibility benchmark!\n\nThis measures how often ChatGPT recommends your business.\n\nTest yours: ${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('✅ Link copied to clipboard!', {
        description: 'Share it on LinkedIn or Twitter',
        duration: 5000,
      });
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadPDF = async () => {
    const loadingToast = toast.loading('Generating PDF...');
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.getElementById('results-content');
      if (!element) {
        toast.error('Unable to generate PDF');
        return;
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const companyName = result.website?.replace(/^https?:\/\/(www\.)?/, '').split('.')[0] || 'Report';
      const fileName = `FoundIndex-Report-${companyName}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.dismiss(loadingToast);
      toast.success('✅ PDF downloaded successfully!', {
        description: `Saved as ${fileName}`,
        duration: 4000,
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate PDF', {
        description: 'Please try again or contact support',
      });
    }
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
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary-hover"
                onClick={handleShareScore}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Score
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
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

        {/* Why Your Score Analysis */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Why Your Score Is {result.foundIndexScore < 30 ? 'Low' : result.foundIndexScore < 70 ? 'Moderate' : 'High'}
          </h2>
          
          <div className="space-y-6">
            {/* Test Summary */}
            <div className="bg-accent/50 p-4 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="font-semibold">We tested {result.queryResults?.length || 15} buyer-intent queries</p>
              </div>
              
              {result.recommendationsCount > 0 ? (
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Your brand was mentioned in <span className="font-bold text-green-600">{result.recommendationsCount}</span> responses</p>
                </div>
              ) : (
                <div className="flex items-start gap-3 mb-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p>Your brand was <span className="font-bold text-red-600">not mentioned</span> in any response</p>
                </div>
              )}
              
              {/* Show top competitors mentioned */}
              {result.queryResults && (() => {
                const competitors = new Map<string, number>();
                result.queryResults.forEach(query => {
                  if (query.contextSnippet) {
                    // Extract potential competitor names (simplified)
                    const matches = query.contextSnippet.match(/\b[A-Z][a-zA-Z]+\b/g);
                    if (matches) {
                      matches.forEach(name => {
                        if (name.length > 3 && !['ChatGPT', 'The', 'This', 'For'].includes(name)) {
                          competitors.set(name, (competitors.get(name) || 0) + 1);
                        }
                      });
                    }
                  }
                });
                
                const topCompetitors = Array.from(competitors.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3);
                
                if (topCompetitors.length > 0) {
                  return (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p>
                        Top mentioned: {topCompetitors.map(([name, count]) => 
                          `${name} (${count}x)`
                        ).join(', ')}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Sample Queries with Actionable Advice */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Sample Queries & How to Improve
              </h3>
              
              {result.queryResults && result.queryResults.slice(0, 3).map((query) => (
                <div 
                  key={query.queryNumber}
                  className="border border-border rounded-lg p-4 mb-4"
                >
                  <div className="flex items-start gap-2 mb-2">
                    {query.wasRecommended ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Query: "{query.queryText}"</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        → {query.wasRecommended ? 'You were recommended!' : 'ChatGPT recommended competitors instead'}
                      </p>
                      
                      {!query.wasRecommended && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3 rounded-md">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            💡 What to do:
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Create content that directly answers this query. Example: Write a blog post or comparison page like "{query.queryText.replace(/best|top|what are/gi, 'Complete guide to')}" that mentions your solution alongside alternatives.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.queryResults && result.queryResults.length > 3 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                Showing 3 of {result.queryResults.length} queries tested
              </p>
            )}
          </div>
        </Card>

        {/* Improvement Tips */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">How to Improve Your FoundIndex Score</h2>
          <p className="text-muted-foreground mb-6">
            Based on 200+ tests, here's what high-scoring companies do:
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Create detailed how-to content</p>
                <p className="text-sm text-muted-foreground">Answer specific questions your buyers ask</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Mention use cases and alternatives</p>
                <p className="text-sm text-muted-foreground">AI models look for comprehensive comparisons</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Update content regularly</p>
                <p className="text-sm text-muted-foreground">Fresh content (30-60 days) gets recommended more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Include comparison charts</p>
                <p className="text-sm text-muted-foreground">Help AI understand your positioning</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Add structured data (Schema markup)</p>
                <p className="text-sm text-muted-foreground">Makes your content more discoverable</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-6 pt-6 border-t">
            These are general recommendations. Site-specific analysis coming in Pro plan.
          </p>
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
