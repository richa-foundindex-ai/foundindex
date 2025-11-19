import { Card } from "@/components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Enter Details",
      description: "Email, website URL, industry. 10 seconds.",
    },
    {
      number: "02",
      title: "We Test 3 AI Engines",
      description:
        "45 queries (15 per engine) matching real buyer questions in your industry.",
    },
    {
      number: "03",
      title: "Get Your FoundIndex",
      description:
        "Score, breakdown, competitor comparison, improvement roadmap. Results in 90 seconds.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-editorial-lg text-center mb-16">How It Works</h2>

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
