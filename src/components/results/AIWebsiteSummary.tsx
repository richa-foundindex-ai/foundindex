import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIWebsiteSummaryProps {
  interpretation: string;
  confidenceScore: number;
  confidenceBreakdown?: {
    hasAudience: boolean;
    hasProblem: boolean;
    hasSolution: boolean;
    isSpecific: boolean;
  };
}

const getConfidenceConfig = (score: number) => {
  if (score >= 85) {
    return {
      label: "Excellent",
      borderColor: "border-l-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      badgeBg: "bg-emerald-100",
    };
  }
  if (score >= 75) {
    return {
      label: "Mostly Clear",
      borderColor: "border-l-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      badgeBg: "bg-blue-100",
    };
  }
  if (score >= 60) {
    return {
      label: "Somewhat Unclear",
      borderColor: "border-l-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      badgeBg: "bg-amber-100",
    };
  }
  return {
    label: "Needs Improvement",
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    badgeBg: "bg-red-100",
  };
};

const AIWebsiteSummary = ({ interpretation, confidenceScore, confidenceBreakdown }: AIWebsiteSummaryProps) => {
  const config = getConfidenceConfig(confidenceScore);

  const checklistItems = [
    { key: "hasAudience", label: "Has target audience", value: confidenceBreakdown?.hasAudience ?? false },
    { key: "hasProblem", label: "Has specific problem", value: confidenceBreakdown?.hasProblem ?? false },
    { key: "hasSolution", label: "Has unique method", value: confidenceBreakdown?.hasSolution ?? false },
    { key: "isSpecific", label: "Is specific (not generic)", value: confidenceBreakdown?.isSpecific ?? false },
  ];

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 p-5 mb-8",
        config.borderColor,
        config.bgColor
      )}
    >
      {/* Heading */}
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 mb-3">
        AI Thinks This Website Is About...
      </h3>

      {/* Interpretation text */}
      <p className="text-base sm:text-lg leading-relaxed text-gray-800 mb-4">
        {interpretation}
      </p>

      {/* Confidence badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className={cn("text-sm font-medium", config.textColor)}>
          Confidence: {confidenceScore}% - {config.label}
        </span>
      </div>

      {/* Checklist */}
      {confidenceBreakdown && (
        <ul className="space-y-1.5">
          {checklistItems.map((item) => (
            <li key={item.key} className="flex items-center gap-2 text-sm text-gray-700">
              {item.value ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span className={item.value ? "text-gray-700" : "text-gray-500"}>
                {item.value ? "✓" : "✗"} {item.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AIWebsiteSummary;
