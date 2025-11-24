import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const WhyItMatters = () => {

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">
          Why AI visibility determines your growth
        </h2>

        <Card className="p-8 bg-accent-gray-light border-none">
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Search shifted. ChatGPT answers 1B+ queries monthly. Claude powers enterprise decisions. Perplexity replaced Google for millions.
            </p>
            <p>
              AI systems recommend businesses they comprehend clearly. Vague websites get excluded. Structured sites get recommended.
            </p>
            <p className="font-medium text-foreground">
              FoundIndex measures the 5 factors that determine AI recommendations.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default WhyItMatters;
