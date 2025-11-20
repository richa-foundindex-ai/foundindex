import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const WhyItMatters = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">
          Why AI-readiness matters
        </h2>

        <Card className="p-8 bg-accent-gray-light border-none">
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Search behavior is changing. More people start their research by asking AI assistants instead of traditional search engines.
            </p>
            <p>
              But AI can only recommend what it understands. If your website isn't structured for AI comprehension, you're invisible to buyers who are ready to purchase.
            </p>
            <p className="font-medium text-foreground">
              FoundIndex shows you exactly how "AI-readable" your site is and what to improve.
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
