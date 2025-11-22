import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const WhyItMatters = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">
          Why AI visibility matters
        </h2>

        <Card className="p-8 bg-accent-gray-light border-none">
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Search behavior is changing. People increasingly ask ChatGPT and Claude for recommendations instead of searching Google.
            </p>
            <p>
              AI only recommends businesses it understands clearly. If your website isn't structured for AI comprehension, you're missing from these recommendations.
            </p>
            <p className="font-medium text-foreground">
              FoundIndex shows you exactly how AI 'sees' your business—and what to fix.
            </p>
          </div>
          
          <div className="mt-8">
            <Link 
              to="/methodology" 
              className="text-primary hover:underline font-medium"
            >
              See our methodology →
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default WhyItMatters;
