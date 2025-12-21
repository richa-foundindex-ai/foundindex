import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2, XCircle, Lightbulb, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AIInterpretationData {
  interpretation: string;
  industry?: string;
  audience?: string;
  problem?: string;
  solution?: string;
  confidenceScore: number;
  confidenceBreakdown?: {
    hasAudience: boolean;
    hasProblem: boolean;
    hasSolution: boolean;
    isSpecific: boolean;
  };
}

interface AIInterpretationSectionProps {
  data: AIInterpretationData | null;
  testId: string;
  onFeedbackSubmit?: (feedback: string) => void;
}

const getConfidenceBadge = (score: number): { bg: string; text: string; label: string } => {
  if (score >= 90) return { bg: "bg-emerald-100", text: "text-emerald-700", label: `${score}% Crystal Clear` };
  if (score >= 75) return { bg: "bg-blue-100", text: "text-blue-700", label: `${score}% Mostly Clear` };
  if (score >= 60) return { bg: "bg-amber-100", text: "text-amber-700", label: `${score}% Somewhat Unclear` };
  return { bg: "bg-red-100", text: "text-red-700", label: `${score}% Needs Improvement` };
};

const getFeedbackConfirmation = (feedback: string): string => {
  switch (feedback) {
    case "accurate":
      return "Thanks! Glad we nailed it.";
    case "close":
      return "Thanks. Check the recommendations below.";
    case "wrong":
      return "Thanks for letting us know. Check the tips above.";
    default:
      return "Thanks for your feedback!";
  }
};

const AIInterpretationSection = ({ data, testId, onFeedbackSubmit }: AIInterpretationSectionProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!data) return null;

  const confidenceBadge = getConfidenceBadge(data.confidenceScore);
  const showImprovementSection = data.confidenceScore < 75;
  const breakdown = data.confidenceBreakdown;

  const handleFeedbackSubmit = async (feedback: string) => {
    if (isSubmitting || selectedFeedback) return;
    
    setIsSubmitting(true);
    try {
      await supabase.functions.invoke("submit-ai-feedback", {
        body: { testId, feedback },
      });

      setSelectedFeedback(feedback);
      onFeedbackSubmit?.(feedback);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      // Still set the feedback visually even if save fails
      setSelectedFeedback(feedback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checklistItems = [
    { key: "isSpecific", label: "Specific industry/niche (not generic)", value: breakdown?.isSpecific },
    { key: "hasAudience", label: "Target customer type/persona", value: breakdown?.hasAudience },
    { key: "hasProblem", label: "Specific problem you solve", value: breakdown?.hasProblem },
    { key: "hasSolution", label: "Your unique method or advantage", value: breakdown?.hasSolution },
  ];

  return (
    <Card className="mb-8 border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        {/* Header with icon, title, subtitle, and badge */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">How AI Systems See You</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Here's what ChatGPT, Claude, and Perplexity understand about your website
              </p>
            </div>
          </div>
          <Badge className={cn("shrink-0 border-0 font-medium", confidenceBadge.bg, confidenceBadge.text)}>
            {confidenceBadge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Interpretation Text - Highlighted box */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <p className="text-base sm:text-lg leading-relaxed font-medium text-foreground">
            {data.interpretation}
          </p>
        </div>

        {/* Success Message (score >= 75) */}
        {!showImprovementSection && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Your value proposition is crystal clear to AI systems. Great job!</p>
                <p className="text-sm mt-1 text-emerald-600">Now focus on the category breakdowns below to fine-tune other aspects</p>
              </div>
            </div>
            
            {/* Show what's working */}
            {breakdown && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">What's working well:</p>
                <ul className="space-y-1">
                  {breakdown.isSpecific && (
                    <li className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Clear industry/niche positioning
                    </li>
                  )}
                  {breakdown.hasAudience && (
                    <li className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Target audience clearly defined
                    </li>
                  )}
                  {breakdown.hasProblem && (
                    <li className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Problem statement is specific
                    </li>
                  )}
                  {breakdown.hasSolution && (
                    <li className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Unique method/advantage stated
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Improvement Section (score < 75) */}
        {showImprovementSection && (
          <div className="space-y-4">
            {/* Confidence Checklist */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2 mb-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-amber-800">
                  To improve how AI understands you, make sure your homepage clearly mentions:
                </p>
              </div>
              <ul className="space-y-2 ml-7">
                {checklistItems.map((item) => (
                  <li key={item.key} className="flex items-center gap-2 text-sm">
                    {item.value ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className={item.value ? "text-emerald-700" : "text-amber-900"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Fix Tip Box */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">Quick Fix:</p>
              </div>
              <p className="text-sm text-muted-foreground mb-3 ml-7">
                Move this sentence structure to your H1 or first paragraph:
              </p>
              <div className="bg-background rounded border border-border p-3 ml-7">
                <p className="text-sm font-mono text-muted-foreground">
                  [We help] [specific customer type] [solve specific problem] [by your unique method]
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-3 ml-7 italic">
                Example: "We help marketing agencies reduce meeting time by 80% using AI-powered meeting transcription."
              </p>
              <p className="text-xs text-muted-foreground mt-3 ml-7">
                Update your homepage and retest in 1-2 weeks to see your score improve.
              </p>
            </div>
          </div>
        )}

        {/* Feedback Buttons */}
        <div className="pt-4 border-t border-border/50">
          {!selectedFeedback ? (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Was this accurate?</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedbackSubmit("accurate")}
                  disabled={isSubmitting}
                  className="text-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Yes, that's exactly what we do
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedbackSubmit("close")}
                  disabled={isSubmitting}
                  className="text-sm hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors"
                >
                  ~ Close, but missing something
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedbackSubmit("wrong")}
                  disabled={isSubmitting}
                  className="text-sm hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Way off, they misunderstood us
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {getFeedbackConfirmation(selectedFeedback)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInterpretationSection;
