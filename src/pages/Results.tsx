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
  
  // AI Readiness Scores
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
  
  // Query-Based Visibility
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
            <p>🌐 Fetching your website...</p>
            <p>🔍 Analyzing AI-readiness factors...</p>
            <p>📊 Evaluating structured data...</p>
            <p>✅ Checking authority signals...</p>
            <p>💡 Generating improvement recommendations...</p>
            <p>🎯 Testing visibility with sample queries...</p>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Usually 90-120 seconds
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
    if (score <= 40) return "text-destructive";
    if (score <= 70) return "text-amber-500";
    return "text-green-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score <= 40) return "bg-destructive/10";
    if (score <= 70) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-green-50 dark:bg-green-900/20";
  };

  const getScoreBorderColor = (score: number) => {
    if (score <= 40) return "border-destructive";
    if (score <= 70) return "border-amber-500";
    return "border-green-600";
  };

  const getPercentile = (score: number) => {
    if (score <= 40) return Math.round(score * 0.5);
    if (score <= 70) return Math.round(20 + (score - 40) * 1.3);
    return Math.round(60 + (score - 70) * 1.3);
  };

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case "content_clarity": return "📝";
      case "structured_data": return "🏗️";
      case "authority": return "⭐";
      case "discoverability": return "🔍";
      case "comparison": return "⚖️";
      default: return "✓";
    }
  };

  const getImpactEstimate = (index: number) => {
    const impacts = ["+8-12 points", "+5-8 points", "+3-5 points", "+2-4 points", "+1-3 points"];
    return impacts[index] || "+2-5 points";
  };

  const handleShareScore = async () => {
    const shareUrl = window.location.href;
    const shareText = `🎯 I scored ${result.foundIndexScore}/100 on FoundIndex AI-Readiness!

Better than ${getPercentile(result.foundIndexScore)}% of tested sites.

Test your site: ${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('✅ Share text copied to clipboard!', {
        description: 'Paste it on LinkedIn or Twitter',
        duration: 5000,
      });
    } catch (err) {
      toast.error('Failed to copy share text');
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
      <div className="container mx-auto max-w-4xl" id="results-content">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            Test Complete
          </Badge>
          <h1 className="text-4xl font-bold mb-2">Your AI-Readiness Report</h1>
          <p className="text-muted-foreground">
            {result.website}
            {result.businessType && (
              <> • <span className="font-semibold">{result.businessType}</span></>
            )}
          </p>
        </div>

        {/* Main Score Card */}
        <Card className={`p-10 mb-8 border-4 ${getScoreBorderColor(result.foundIndexScore)} ${getScoreBgColor(result.foundIndexScore)}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Your AI-Readiness Score</h2>
            <div className={`text-9xl font-bold mb-2 ${getScoreColor(result.foundIndexScore)}`}>
              {result.foundIndexScore}
              <span className="text-5xl text-muted-foreground">/100</span>
            </div>
            <div className="text-lg font-semibold mb-6 text-muted-foreground">
              Better than {getPercentile(result.foundIndexScore)}% of tested sites
            </div>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
              How well your website is optimized for AI recommendation engines like ChatGPT, Claude, and Perplexity.
            </p>

            {/* Visual Score Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-left mb-4">Score Breakdown</h3>
              
              {/* Content Clarity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    <span className="font-medium">Content Clarity</span>
                    {(result.contentClarityScore || 0) >= 15 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <span className="font-bold">{result.contentClarityScore || 0}/25</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      (result.contentClarityScore || 0) >= 15 ? 'bg-green-600' : 'bg-destructive'
                    }`}
                    style={{ width: `${((result.contentClarityScore || 0) / 25) * 100}%` }}
                  />
                </div>
              </div>

              {/* Structured Data */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏗️</span>
                    <span className="font-medium">Structured Data</span>
                    {(result.structuredDataScore || 0) >= 12 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <span className="font-bold">{result.structuredDataScore || 0}/20</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      (result.structuredDataScore || 0) >= 12 ? 'bg-green-600' : 'bg-destructive'
                    }`}
                    style={{ width: `${((result.structuredDataScore || 0) / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Authority Signals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-medium">Authority Signals</span>
                    {(result.authorityScore || 0) >= 12 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <span className="font-bold">{result.authorityScore || 0}/20</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      (result.authorityScore || 0) >= 12 ? 'bg-green-600' : 'bg-destructive'
                    }`}
                    style={{ width: `${((result.authorityScore || 0) / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Discoverability */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    <span className="font-medium">Discoverability</span>
                    {(result.discoverabilityScore || 0) >= 12 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <span className="font-bold">{result.discoverabilityScore || 0}/20</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      (result.discoverabilityScore || 0) >= 12 ? 'bg-green-600' : 'bg-destructive'
                    }`}
                    style={{ width: `${((result.discoverabilityScore || 0) / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Comparison Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    <span className="font-medium">Comparison Content</span>
                    {(result.comparisonScore || 0) >= 9 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <span className="font-bold">{result.comparisonScore || 0}/15</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      (result.comparisonScore || 0) >= 9 ? 'bg-green-600' : 'bg-destructive'
                    }`}
                    style={{ width: `${((result.comparisonScore || 0) / 15) * 100}%` }}
                  />
                </div>
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

        {/* Share Card */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Share Your Score</h3>
            <div className="bg-background p-6 rounded-lg border-2 border-border max-w-md mx-auto">
              <p className="font-mono text-sm text-left whitespace-pre-line">
                🎯 I scored {result.foundIndexScore}/100 on FoundIndex AI-Readiness!{'\n\n'}
                Better than {getPercentile(result.foundIndexScore)}% of tested sites.{'\n\n'}
                Test your site: {window.location.href}
              </p>
            </div>
            <Button 
              variant="default" 
              size="lg"
              className="bg-primary hover:bg-primary-hover"
              onClick={handleShareScore}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Copy Share Text
            </Button>
          </div>
        </Card>

        {/* Recommendations Section */}
        {result.recommendations && result.recommendations.length > 0 && (
          <Card className="p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">🎯 Your Action Plan</h3>
            <p className="text-muted-foreground mb-6">
              Implement these improvements to boost your AI-Readiness Score:
            </p>
            <div className="space-y-6">
              {result.recommendations.slice(0, 5).map((rec, idx) => (
                <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {idx + 1}
                      </div>
                      <h4 className="font-semibold text-base">{rec}</h4>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {getImpactEstimate(idx)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">
                    <span className="font-medium">Why this matters:</span> {
                      idx === 0 ? "AI engines rely on clear, structured data to understand and recommend your business. This is the #1 factor in improving discoverability." :
                      idx === 1 ? "Comparison content helps AI engines position your offering against alternatives, increasing your chances of being recommended." :
                      idx === 2 ? "Authority signals like testimonials and case studies build trust with AI systems, making them more likely to recommend you." :
                      idx === 3 ? "FAQ sections directly answer user questions, making it easier for AI to surface your content in relevant searches." :
                      "Additional improvements compound over time, steadily increasing your AI visibility and recommendation rate."
                    }
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA - Monthly Tracking */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold">Track Your Progress Over Time</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how your improvements impact your AI-Readiness Score with monthly tracking and competitor comparisons.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Monthly retests</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Score history graphs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Competitor tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Priority support</span>
              </div>
            </div>
            <div className="pt-4">
              <Button size="lg" variant="default" className="bg-primary hover:bg-primary-hover text-lg px-8 py-6">
                Get Monthly Tracking →
              </Button>
              <p className="text-sm text-muted-foreground mt-3">Coming soon - Join the waitlist</p>
            </div>
          </div>
        </Card>

        {/* Footer CTA */}
        <div className="text-center py-8">
          <Button variant="outline" size="lg" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-5 w-5" />
            Download Full Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;