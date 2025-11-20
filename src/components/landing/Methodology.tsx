import { Card } from "@/components/ui/card";
import { HelpCircle, TestTube, Scale, BarChart3 } from "lucide-react";

const Methodology = () => {
  const methodCards = [
    {
      icon: HelpCircle,
      title: "Real Buyer Questions",
      description:
        "We source queries from actual buyer conversations, reviews, and high-intent search phrases. Examples include: 'Best [category] for [use case]' or '[Tool A] vs [Tool B] pricing'.",
    },
    {
      icon: TestTube,
      title: "Standardized Testing",
      description:
        "Every test uses fresh sessions with no prior chat history. Standardized prompts reduce personalization bias and make scores comparable over time.",
    },
    {
      icon: Scale,
      title: "Weighted Scoring",
      description:
        "Your score accounts for how prominent and how clear the recommendation is, not just whether you're mentioned by name.",
    },
    {
      icon: BarChart3,
      title: "Benchmark Calibration",
      description:
        "As more companies run tests, we can share more context about typical score ranges by category and use case—without inflating or inventing numbers.",
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
