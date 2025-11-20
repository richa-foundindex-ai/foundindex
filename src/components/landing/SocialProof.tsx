import { Card } from "@/components/ui/card";

const SocialProof = () => {
  const stats = [
    {
      value: "AI-native",
      label: "Built for assistant-era search",
    },
    {
      value: "Buyer-led",
      label: "Focused on real evaluation questions",
    },
    {
      value: "Transparent",
      label: "No inflated or unsourced claims",
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-editorial-lg text-center mb-16">
          Built on Real Data
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-10 text-center bg-accent-gray-light border-none"
            >
              <p className="text-5xl font-bold text-primary mb-3">
                {stat.value}
              </p>
              <p className="text-xl font-semibold mb-1">{stat.label}</p>
              {stat.sublabel && (
                <p className="text-muted-foreground">{stat.sublabel}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
