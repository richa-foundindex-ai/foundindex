import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileCode, Layers, Target } from "lucide-react";

const ProblemSection = () => {
  const problems = [
    {
      icon: FileCode,
      title: "Schema Markup Problems",
      description: "Missing structured data means AI can't extract key facts about your business, products, or services."
    },
    {
      icon: Layers,
      title: "Content Structure Issues", 
      description: "Poor heading hierarchy confuses AI about your page topic and what information is most important."
    },
    {
      icon: Target,
      title: "Clarity & Authority Gaps",
      description: "Weak value proposition means AI reads you as less authoritative and less worthy of recommendation."
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-accent-gray-light">
      <div className="container mx-auto px-4">
        <h2 className="text-editorial-lg text-center mb-6">
          Why Most Websites Are Invisible to AI
        </h2>
        
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-lg text-muted-foreground mb-4">
            AI search is growing fast. ChatGPT has 200M+ users. Perplexity grew 500%+ last year. 
            When customers ask AI for recommendations, will they find you?
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">87% of websites have structural issues that make them invisible to AI</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <Card key={index} className="border-2 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <problem.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
