import { Card } from "@/components/ui/card";

const HowItWorks = () => {
  const factors = [
    {
      title: "Content Clarity",
      points: "30 points",
      description: "Does your homepage explicitly state what you do, who you serve, and the outcomes you deliver?"
    },
    {
      title: "Discoverability",
      points: "25 points",
      description: "Can AI easily locate your services, pricing, audience, and proof?"
    },
    {
      title: "Authority Signals",
      points: "15 points",
      description: "Do you provide evidence that builds confidence—testimonials, case studies, credentials?"
    },
    {
      title: "Structured Data",
      points: "15 points",
      description: "Is your page organized with semantic HTML, clear headings, and metadata that helps AI extract meaning?"
    },
    {
      title: "Comparison Content",
      points: "15 points",
      description: "Can AI understand how you're distinct from competitors?"
    }
  ];

  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">
          How FoundIndex works
        </h2>

        <Card className="p-8 bg-background border-none mb-8">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            FoundIndex analyzes five factors that determine whether AI can understand and recommend your business:
          </p>

          <div className="space-y-6">
            {factors.map((factor, index) => (
              <div key={index} className="border-l-4 border-primary pl-6 py-2">
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {index + 1}. {factor.title}
                  </h3>
                  <span className="text-sm font-medium text-primary ml-4">
                    {factor.points}
                  </span>
                </div>
                <p className="text-base text-muted-foreground">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mt-8">
            Your <strong className="text-foreground">AI Visibility Score</strong> (0–100) reflects how well these signals appear—and how confidently AI can recommend you. You also get prioritized fixes ranked by impact.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default HowItWorks;
