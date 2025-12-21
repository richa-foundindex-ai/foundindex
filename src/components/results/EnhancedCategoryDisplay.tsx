import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIVisibility {
  google: boolean;
  perplexity: boolean;
  chatgpt: boolean;
  feedReaders: boolean;
}

interface SchemaBreakdown {
  schemaLocation?: "none" | "static" | "javascript" | "both";
  aiVisibility?: AIVisibility;
  schemasFound?: string[];
}

interface SemanticBreakdown {
  hasH1?: boolean;
  hasHierarchy?: boolean;
  hasSemanticTags?: boolean;
  hasListStructure?: boolean;
  missingTags?: string[];
}

interface EnhancedCategoryProps {
  categoryKey: string;
  score: number;
  max: number;
  breakdown?: SchemaBreakdown | SemanticBreakdown | unknown;
}

const getScoreColor = (percentage: number): { bg: string; text: string } => {
  if (percentage >= 85) return { bg: "bg-emerald-500", text: "text-emerald-600" };
  if (percentage >= 70) return { bg: "bg-amber-400", text: "text-amber-600" };
  if (percentage >= 40) return { bg: "bg-orange-500", text: "text-orange-600" };
  return { bg: "bg-red-500", text: "text-red-600" };
};

// Schema Markup Enhanced Display
export const SchemaMarkupDisplay = ({ score, max, breakdown }: { 
  score: number; 
  max: number; 
  breakdown?: SchemaBreakdown;
}) => {
  const percentage = Math.round((score / max) * 100);
  const color = getScoreColor(percentage);
  const schemaData = breakdown as SchemaBreakdown | undefined;
  
  const schemaLocation = schemaData?.schemaLocation || (score > 0 ? "static" : "none");
  const aiVisibility = schemaData?.aiVisibility || {
    google: score > 0,
    perplexity: score > 0,
    chatgpt: score > 0 && schemaLocation !== "javascript",
    feedReaders: score > 0 && schemaLocation !== "javascript",
  };

  const getLocationLabel = () => {
    switch (schemaLocation) {
      case "static": return "static HTML";
      case "javascript": return "JavaScript";
      case "both": return "static HTML and JavaScript";
      default: return "not detected";
    }
  };

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Schema Markup</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px]">
                <p className="text-xs">Evaluates structured data markup that helps AI understand your content. Schema in static HTML is visible to all AI systems.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className={`text-sm font-bold ${color.text}`}>
          {score}/{max}
        </span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      {/* Found status */}
      <div className="flex items-center gap-2 text-sm">
        {score > 0 ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Valid schema detected in <strong>{getLocationLabel()}</strong></span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-500" />
            <span>No schema markup detected</span>
          </>
        )}
      </div>

      {/* AI Visibility breakdown */}
      {score > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visible to:</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              {aiVisibility.google ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              )}
              <span>Google</span>
            </div>
            <div className="flex items-center gap-1.5">
              {aiVisibility.perplexity ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              )}
              <span>Perplexity</span>
            </div>
            <div className="flex items-center gap-1.5">
              {aiVisibility.chatgpt ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span>ChatGPT {!aiVisibility.chatgpt && "(limited)"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {aiVisibility.feedReaders ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              )}
              <span>Feed readers</span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      {score === 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Recommendation:</strong> Add JSON-LD schema markup to help AI systems understand your content.
          </p>
        </div>
      )}
      {score > 0 && schemaLocation === "javascript" && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Recommendation:</strong> Move schema to static HTML or pre-render for universal AI visibility.
          </p>
        </div>
      )}
    </div>
  );
};

// Semantic Structure Enhanced Display
export const SemanticStructureDisplay = ({ score, max, breakdown }: { 
  score: number; 
  max: number; 
  breakdown?: SemanticBreakdown;
}) => {
  const percentage = Math.round((score / max) * 100);
  const color = getScoreColor(percentage);
  const semanticData = breakdown as SemanticBreakdown | undefined;
  
  // Infer from score if no breakdown provided
  const hasH1 = semanticData?.hasH1 ?? score >= 3;
  const hasHierarchy = semanticData?.hasHierarchy ?? score >= 6;
  const hasSemanticTags = semanticData?.hasSemanticTags ?? score >= 9;
  const hasListStructure = semanticData?.hasListStructure ?? score >= 12;
  const missingTags = semanticData?.missingTags || [];

  const criteria = [
    { label: "H1 heading", met: hasH1 },
    { label: "Heading hierarchy", met: hasHierarchy },
    { label: "Semantic tags", met: hasSemanticTags, note: missingTags.length > 0 ? `missing ${missingTags.slice(0, 2).join(", ")}` : undefined },
    { label: "List structure", met: hasListStructure },
  ];

  const metCount = criteria.filter(c => c.met).length;

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Semantic Structure</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px]">
                <p className="text-xs">Analyzes HTML structure including headings, semantic tags, and content organization that helps AI understand your page.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className={`text-sm font-bold ${color.text}`}>
          {score}/{max}
        </span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      {/* Criteria breakdown */}
      <div className="space-y-1.5 pt-2 border-t border-border/50">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Found:</p>
        <div className="space-y-1 text-xs">
          {criteria.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {item.met ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span>
                {item.label}
                {item.note && <span className="text-muted-foreground"> ({item.note})</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI visibility note */}
      <div className="pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          <strong>Visible to:</strong> All AI systems can parse semantic HTML. Screen readers also benefit from proper structure.
        </p>
      </div>

      {/* Recommendation if not perfect */}
      {metCount < 4 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong>Recommendation:</strong> {
              !hasH1 ? "Add an H1 heading to define the main topic." :
              !hasHierarchy ? "Use H2 and H3 headings to create a clear hierarchy." :
              !hasSemanticTags ? `Add semantic HTML tags${missingTags.length > 0 ? `: ${missingTags.slice(0, 2).join(", ")}` : ""}.` :
              "Add list elements (ul/ol) for better content structure."
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Main component that decides which display to use
const EnhancedCategoryDisplay = ({ categoryKey, score, max, breakdown }: EnhancedCategoryProps) => {
  if (categoryKey === "schemaMarkup") {
    return <SchemaMarkupDisplay score={score} max={max} breakdown={breakdown as SchemaBreakdown} />;
  }
  
  if (categoryKey === "semanticStructure") {
    return <SemanticStructureDisplay score={score} max={max} breakdown={breakdown as SemanticBreakdown} />;
  }
  
  // Return null for other categories (they use the regular display)
  return null;
};

export default EnhancedCategoryDisplay;
