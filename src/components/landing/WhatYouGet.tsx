import { Card } from "@/components/ui/card";
import { Target, Gauge, TrendingUp, ListChecks } from "lucide-react";

const WhatYouGet = () => {
  const features = [
    {
      icon: Target,
      title: "Your FoundIndex Score",
      description:
        "0-100 score showing AI visibility. See where you rank: 62nd percentile of tested SaaS companies, 3rd of 7 direct competitors.",
    },
    {
      icon: Gauge,
      title: "Engine Breakdown",
      description:
        "Performance across ChatGPT (53/100), Claude (40/100), Perplexity (47/100). Identify which platforms work and which need attention.",
    },
    {
      icon: TrendingUp,
      title: "Benchmark Comparison",
      description:
        "How you compare to industry averages and direct competitors. See the gap to #1 and what it takes to get there.",
    },
    {
      icon: ListChecks,
      title: "Priority Roadmap",
      description:
        "Ranked action plan: content freshness (+15 pts), schema markup (+12 pts), Reddit presence (+10 pts). Based on 200+ tested sites.",
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
