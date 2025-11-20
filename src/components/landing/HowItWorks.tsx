import { Card } from "@/components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Enter your website URL",
      description: "We fetch and analyze your website's content and structure.",
    },
    {
      number: "02",
      title: "AI evaluates 5 key factors",
      description:
        "We check content clarity, structured data, authority signals, discoverability, and comparison content.",
    },
    {
      number: "03",
      title: "Get your score and recommendations",
      description:
        "See your 0-100 score and specific improvements you can make today.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-editorial-lg text-center mb-16">How we analyze your site</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="p-8 bg-background">
              <div className="text-4xl font-bold text-primary mb-4">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
