import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Bell, Users, BarChart } from "lucide-react";

const TrackingSection = () => {
  const features = [
    { icon: TrendingUp, text: "Automated weekly retesting" },
    { icon: Bell, text: "Email alerts when your score changes" },
    { icon: Users, text: "Competitor movement notifications" },
    { icon: BarChart, text: "Historical trend charts" },
  ];

  return (
    <section className="py-20 px-4 bg-accent-red-light">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-editorial-lg text-center mb-6">
          Turn Your FoundIndex Into a KPI
        </h2>
        <p className="text-xl text-center text-muted-foreground mb-12">
          The best companies track their FoundIndex monthly—like web traffic
        </p>

        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-body-lg text-center mb-8">
            Your FoundIndex changes as you publish content, update pages, and get
            mentioned in new places. One-time testing shows a snapshot. Ongoing
            tracking shows trends.
          </p>

          <div className="bg-background rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">
              FoundIndex Tracking includes:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-lg">{feature.text}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-lg">Team sharing & collaboration</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-hover text-primary-foreground text-lg px-8 py-6"
          >
            Start Tracking Your FoundIndex
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-muted-foreground mt-4">
            Pro: $49/mo • Business: $199/mo • Starting Feb 2026
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrackingSection;
