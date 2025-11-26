import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CategoryTooltipProps {
  category: string;
}

const tooltipContent: Record<string, string> = {
  "Content Clarity": "How clearly your homepage explains what you do, for whom, and why it matters",
  "Discoverability": "How easily AI systems can extract and understand key information from your page structure",
  "Authority Signals": "Credibility markers like case studies, testimonials, client logos, and expert credentials",
  "Structured Data": "Meta descriptions, headers, and navigation that help AI understand your content",
  "Comparison Content": "How clearly you differentiate yourself and provide comparison context",
};

export const CategoryTooltip = ({ category }: CategoryTooltipProps) => {
  const content = tooltipContent[category];
  
  if (!content) return null;

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center justify-center ml-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <Info className="h-3.5 w-3.5" />
          <span className="sr-only">More info about {category}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};
