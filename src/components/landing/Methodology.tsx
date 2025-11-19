import { Card } from "@/components/ui/card";
import { HelpCircle, TestTube, Scale, BarChart3 } from "lucide-react";

const Methodology = () => {
  const methodCards = [
    {
      icon: HelpCircle,
      title: "Real Buyer Questions",
      description:
        "We source 45 queries from actual buyer interviews, G2/Capterra reviews, and high-intent search data. Examples: 'Best [category] for [specific use-case]' or '[Product A] vs [Product B] pricing'.",
    },
    {
      icon: TestTube,
      title: "Standardized Testing",
      description:
        "Every test uses fresh API sessions with no chat history. Standardized prompts eliminate personalization bias. We test against latest models: GPT-4o, Claude 3.5 Sonnet, Perplexity real-time search.",
    },
    {
      icon: Scale,
      title: "Weighted Scoring",
      description:
        "Your score accounts for recommendation position (1st vs 5th), context quality (detailed vs passing mention), and query recency. Not all mentions are equal—we measure impact.",
    },
    {
      icon: BarChart3,
      title: "Benchmark Calibration",
      description:
        "Your score is calibrated against our proprietary database of 10,000+ AI query results from 200+ companies. You're not just getting a number—you're getting your position in the AI visibility landscape.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-editorial-lg text-center mb-6">
          How We Calculate Your FoundIndex
        </h2>
        <p className="text-xl text-center text-muted-foreground mb-12">
          Transparent, Research-Backed Testing
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {methodCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="p-8 bg-background hover:shadow-lg transition-shadow">
                <Icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 border-l-4 border-l-primary bg-background">
          <p className="text-lg">
            <span className="font-bold">Methodology Details:</span>{" "}
            <a href="#" className="text-primary hover:underline">
              Link to dedicated page explaining full testing process, query
              examples, scoring algorithm
            </a>
          </p>
        </Card>
      </div>
    </section>
  );
};

export default Methodology;
