import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CheckCircle2, AlertCircle, Target, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  onFeedbackSubmit?: (feedback: "accurate" | "close" | "wrong") => void;
}

const getConfidenceColor = (score: number): { bg: string; text: string; label: string } => {
  if (score >= 90) return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Crystal Clear" };
  if (score >= 75) return { bg: "bg-blue-100", text: "text-blue-700", label: "Mostly Clear" };
  if (score >= 60) return { bg: "bg-amber-100", text: "text-amber-700", label: "Somewhat Unclear" };
  return { bg: "bg-red-100", text: "text-red-700", label: "Needs Improvement" };
};

const AIInterpretationSection = ({ data, testId, onFeedbackSubmit }: AIInterpretationSectionProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<"accurate" | "close" | "wrong" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!data) return null;

  const confidenceStyle = getConfidenceColor(data.confidenceScore);

  const handleFeedbackSubmit = async (feedback: "accurate" | "close" | "wrong") => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-ai-feedback", {
        body: { testId, feedback },
      });

      if (error) throw error;

      setSelectedFeedback(feedback);
      toast({
        title: "Thank you for your feedback!",
        description: "This helps us improve our AI analysis.",
      });
      onFeedbackSubmit?.(feedback);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      // Still set the feedback visually even if save fails
      setSelectedFeedback(feedback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 border-blue-200 bg-gradient-to-br from-blue-50/50 to-slate-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">How AI Systems See You</CardTitle>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-sm">
                  <p>This is what ChatGPT, Claude, and Perplexity extract from your homepage</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge className={`${confidenceStyle.bg} ${confidenceStyle.text} border-0`}>
            {data.confidenceScore}% {confidenceStyle.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Interpretation */}
        <div className="bg-white/60 rounded-lg p-4 border border-blue-100">
          <p className="text-base leading-relaxed">
            <span className="font-medium text-blue-900">{data.interpretation}</span>
          </p>
        </div>

        {/* Confidence Score Feedback */}
        {data.confidenceScore >= 75 ? (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">Your value proposition is clear to AI systems</span>
          </div>
        ) : (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex items-start gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-amber-800">
                Your opening section should clearly mention:
              </span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-amber-900 ml-7">
              <li className={data.confidenceBreakdown?.isSpecific ? "text-emerald-700" : ""}>
                Specific industry/niche (not too generic)
                {data.confidenceBreakdown?.isSpecific && <CheckCircle2 className="h-3.5 w-3.5 inline ml-1" />}
              </li>
              <li className={data.confidenceBreakdown?.hasAudience ? "text-emerald-700" : ""}>
                Target customer type/persona
                {data.confidenceBreakdown?.hasAudience && <CheckCircle2 className="h-3.5 w-3.5 inline ml-1" />}
              </li>
              <li className={data.confidenceBreakdown?.hasProblem ? "text-emerald-700" : ""}>
                Specific problem you solve
                {data.confidenceBreakdown?.hasProblem && <CheckCircle2 className="h-3.5 w-3.5 inline ml-1" />}
              </li>
              <li className={data.confidenceBreakdown?.hasSolution ? "text-emerald-700" : ""}>
                Your unique method or advantage
                {data.confidenceBreakdown?.hasSolution && <CheckCircle2 className="h-3.5 w-3.5 inline ml-1" />}
              </li>
            </ol>
            <div className="mt-4 p-3 bg-white/80 rounded border border-amber-200">
              <p className="text-xs text-amber-700 font-medium mb-1">Example:</p>
              <p className="text-sm text-amber-900 italic">
                "We help SaaS founders reduce churn through AI-powered retention analytics."
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Move this to your homepage H1 or first sentence.
              </p>
            </div>
          </div>
        )}

        {/* User Feedback Section */}
        {!selectedFeedback ? (
          <div className="pt-3 border-t border-blue-100">
            <p className="text-sm text-muted-foreground mb-3">Is this accurate?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedbackSubmit("accurate")}
                disabled={isSubmitting}
                className="text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Yes, that's exactly what we do
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedbackSubmit("close")}
                disabled={isSubmitting}
                className="text-xs hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
              >
                Close, but missing something
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedbackSubmit("wrong")}
                disabled={isSubmitting}
                className="text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Way off, they misunderstood us
              </Button>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-blue-100">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Thanks for your feedback!
              {selectedFeedback === "accurate" && " Glad we got it right."}
              {selectedFeedback === "close" && " We'll work on improving our accuracy."}
              {selectedFeedback === "wrong" && " This helps us understand where to improve."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInterpretationSection;
