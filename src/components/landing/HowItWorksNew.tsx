import { Card, CardContent } from "@/components/ui/card";
import { Link2, Timer, TrendingUp, CheckCircle } from "lucide-react";

const HowItWorksNew = () => {
  const steps = [
    {
      icon: Link2,
      step: "1",
      title: "Paste Your URL",
      description: "5 seconds",
      detail: "Enter your homepage or blog post URL"
    },
    {
      icon: Timer,
      step: "2",
      title: "Get Your Score",
      description: "60 seconds analysis",
      detail: "Receive your A-F grade and 0-100 score"
    },
    {
      icon: TrendingUp,
      step: "3",
      title: "Implement & Improve",
      description: "Follow recommendations",
      detail: "Fix issues to boost your AI visibility"
    }
  ];

  const improvements = [
    { action: "Fix schema markup", points: "+5-8 points" },
    { action: "Clarify value proposition", points: "+8-12 points" },
    { action: "Add authority signals", points: "+5-10 points" },
    { action: "Improve heading structure", points: "+3-7 points" }
  ];

  return (
    <section className="py-16 md:py-20 bg-accent-gray-light">
      <div className="container mx-auto px-4">
        <h2 className="text-editorial-lg text-center mb-12">
          Three Steps to Better AI Visibility
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="border-2 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-primary font-medium mb-2">{step.description}</p>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-lg mx-auto border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h3 className="font-bold text-center mb-4">Example Improvements</h3>
            <ul className="space-y-3">
              {improvements.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    {item.action}
                  </span>
                  <span className="font-semibold text-primary">{item.points}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HowItWorksNew;
