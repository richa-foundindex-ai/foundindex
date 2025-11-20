import { Card } from "@/components/ui/card";
import { Target, Gauge, TrendingUp, ListChecks } from "lucide-react";

const WhatYouGet = () => {
  const features = [
    {
      icon: Target,
      title: "Your FoundIndex Score",
      description:
        "0-100 score showing how often AI assistants recommend your brand when buyers ask for solutions in your category.",
    },
    {
      icon: Gauge,
      title: "Engine Breakdown",
      description:
        "A view of how you perform across different AI models, so you can see where you're already strong and where to focus.",
    },
    {
      icon: TrendingUp,
      title: "Benchmark Context",
      description:
        "Qualitative context on how to interpret your score today, with more detailed benchmarks added as our dataset grows.",
    },
    {
      icon: ListChecks,
      title: "Priority Roadmap",
      description:
        "Plain-language suggestions for content and messaging improvements that are likely to help AI understand and recommend you more often.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-editorial-lg text-center mb-16">
          Your FoundIndex Report Includes
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-8 hover:shadow-xl transition-shadow"
              >
                <Icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatYouGet;
