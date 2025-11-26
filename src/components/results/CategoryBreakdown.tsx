import { useState } from "react";
import { ChevronDown, CheckCircle2, XCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubScore {
  label: string;
  score: number;
  max: number;
}

interface CategoryProps {
  label: string;
  score: number;
  max: number;
  tooltip: string;
  subScores?: SubScore[];
}

const CategoryBreakdown = ({
  label,
  score,
  max,
  tooltip,
  subScores,
}: CategoryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const percentage = ((score ?? 0) / max) * 100;
  const isGood = percentage > 70;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{label}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {subScores && subScores.length > 0 && (
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  isGood ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                {score ?? 0}/{max}
              </span>
              {isGood ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <Progress value={percentage} className="h-2" />

        {subScores && subScores.length > 0 && (
          <CollapsibleContent>
            <div className="mt-3 ml-2 pl-3 border-l-2 border-muted space-y-2.5 animate-fade-in">
              {subScores.map((sub, idx) => {
                const subPercentage = ((sub.score ?? 0) / sub.max) * 100;
                const subIsGood = subPercentage > 70;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{sub.label}</span>
                      <span
                        className={`text-xs font-medium ${
                          subIsGood ? "text-emerald-600" : "text-muted-foreground"
                        }`}
                      >
                        {sub.score ?? 0}/{sub.max} pts
                      </span>
                    </div>
                    <Progress value={subPercentage} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};

export default CategoryBreakdown;
