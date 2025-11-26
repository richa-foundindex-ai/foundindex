import { useState } from "react";
import { ChevronDown, CheckCircle2, XCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubScore {
  label: string;
  score: number;
  max: number;
  description?: string;
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
  const hasSubScores = subScores && subScores.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-2">
        <CollapsibleTrigger className="w-full">
          <div 
            className={`flex items-center justify-between group cursor-pointer p-3 -m-3 rounded-lg transition-all duration-200 ${
              hasSubScores ? 'hover:bg-muted/50' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {hasSubScores && (
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              )}
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

        {hasSubScores && (
          <CollapsibleContent>
            <div className="mt-4 space-y-3 animate-fade-in">
              {subScores.map((sub, idx) => {
                const subPercentage = ((sub.score ?? 0) / sub.max) * 100;
                const subIsGood = subPercentage > 70;
                const isLast = idx === subScores.length - 1;
                
                return (
                  <div key={idx} className="relative pl-5">
                    {/* Tree structure lines */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col">
                      <span className="text-muted-foreground/50 text-xs font-mono leading-none">
                        {isLast ? '└─' : '├─'}
                      </span>
                      {!isLast && (
                        <div className="absolute left-[3px] top-4 bottom-0 w-px bg-muted-foreground/20" />
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-foreground/80">{sub.label}</span>
                          {sub.description && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              {sub.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold ml-2 whitespace-nowrap ${
                            subIsGood ? "text-emerald-600" : "text-muted-foreground"
                          }`}
                        >
                          {sub.score ?? 0}/{sub.max} pts
                        </span>
                      </div>
                      <Progress value={subPercentage} className="h-1" />
                    </div>
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
