import { Card } from "@/components/ui/card";

const ComingInV2 = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">
          What's coming next
        </h2>

        <Card className="p-8 bg-accent-gray-light border-none">
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              We're building v2 based on what we learn from your feedback:
            </p>
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Multi-page analysis (homepage + 5 key pages)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Competitor comparison (see how you rank vs. others in your industry)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Citation tracking (monitor if AI starts mentioning your business)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Industry benchmarks (compare your score to sector averages)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <span>Monthly monitoring (track improvements as you implement changes)</span>
              </li>
            </ul>
            <p className="font-medium text-foreground">
              Want early access? Share your v1 results and we'll notify you when v2 launches.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ComingInV2;
