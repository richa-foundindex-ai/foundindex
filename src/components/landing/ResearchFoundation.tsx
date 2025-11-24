import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ResearchFoundation = () => {
  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">
          Research-backed methodology
        </h2>

        <Card className="p-8 bg-background border-none">
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              FoundIndex scoring built on:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">→</span>
                <span>Analysis of 5 major AI systems (Claude, ChatGPT, Perplexity, Gemini, Deepseek)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">→</span>
                <span>Validated against real websites</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">→</span>
                <span>Correlation confirmed: Sites scoring 70+ = accurate AI responses. Sites scoring &lt;40 = AI declined recommendations</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-8">
            <Link 
              to="/methodology"
              className="text-primary hover:underline font-medium"
            >
              Read full methodology →
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ResearchFoundation;
