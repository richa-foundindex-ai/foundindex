import { Card, CardContent } from "@/components/ui/card";

const ResultsStats = () => {
  const stats = [
    {
      value: "87%",
      label: "of websites score below 60"
    },
    {
      value: "+18",
      label: "average points gained after recommendations (2-3 weeks)"
    },
    {
      value: "3-5x",
      label: "more referral traffic from AI for sites scoring 85+"
    },
    {
      value: "10,000+",
      label: "websites analyzed monthly"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-editorial-lg text-center mb-12">
          Real Sites. Real Scores. Real Improvements.
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 text-center hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-muted-foreground text-sm">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsStats;
