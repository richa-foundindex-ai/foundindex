import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, FileCode, Layers, MessageSquare, ListOrdered, Shield, Gauge } from "lucide-react";

const SolutionSection = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const categories = [
    {
      icon: FileCode,
      title: "Schema Markup",
      points: "20 pts",
      description: "Structured data quality — JSON-LD, OpenGraph, and semantic markup that AI can read."
    },
    {
      icon: Layers,
      title: "Semantic Structure",
      points: "12 pts",
      description: "HTML markup quality — proper heading hierarchy, semantic elements, and accessible structure."
    },
    {
      icon: MessageSquare,
      title: "Content Clarity",
      points: "25 pts",
      description: "How obvious your business is — clear value prop, target audience, and problem you solve."
    },
    {
      icon: ListOrdered,
      title: "Answer Structure",
      points: "20 pts",
      description: "Are key facts front-loaded? Can AI extract answers without reading entire pages?"
    },
    {
      icon: Shield,
      title: "Authority Signals",
      points: "15 pts",
      description: "Trust & credibility — testimonials, case studies, credentials, and social proof."
    },
    {
      icon: Gauge,
      title: "Technical Foundation",
      points: "8 pts",
      description: "Speed, mobile responsiveness, and crawlability that affects AI access to your content."
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-editorial-lg text-center mb-4">
          FoundIndex Measures Your AI Visibility
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
          See exactly how ChatGPT, Perplexity, and Claude parse your website
        </p>
        <p className="text-center text-muted-foreground mb-10">
          FoundIndex analyzes your website against <span className="font-semibold text-foreground">47 criteria</span> across 6 categories
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <Card 
              key={index}
              className="cursor-pointer border-2 hover:border-primary/30 transition-all"
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">{category.title}</h3>
                      <span className="text-sm text-primary font-medium">{category.points}</span>
                    </div>
                  </div>
                  {expandedCard === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                {expandedCard === index && (
                  <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                    {category.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
