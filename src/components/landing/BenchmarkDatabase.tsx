import { Card } from "@/components/ui/card";

const BenchmarkDatabase = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-editorial-lg text-center mb-6">
          Why FoundIndex Is the Standard
        </h2>
        <p className="text-xl text-center text-muted-foreground mb-12">
          The only AI visibility metric calibrated against real industry data
        </p>

        <div className="prose prose-lg max-w-none mb-12 space-y-6">
          <p className="text-body-lg">
            FoundIndex isn't just a testing tool. It's a way to consistently measure how visible your brand is inside AI assistants.
          </p>

          <p className="text-body-lg">
            Your score shows how often AI engines recommend your brand when buyers ask for solutions. As more companies run tests, the benchmark becomes more useful and representative.
          </p>

          <p className="text-body-lg">
            Your report focuses on:
          </p>

          <div className="space-y-2 text-lg ml-4">
            <p>
              → How often you're recommended when buyers search for solutions
            </p>
            <p>→ How clearly AI understands what you do and who you serve</p>
            <p>→ Which types of content and messaging are most likely to help</p>
          </div>

          <p className="text-body-lg">
            We avoid inflated or unsourced claims. Everything in your report comes directly from the AI responses we test.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenchmarkDatabase;
