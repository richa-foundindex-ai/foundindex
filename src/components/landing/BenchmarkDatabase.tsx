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
            FoundIndex isn't just a testing tool. It's a benchmark standard—like
            Domain Authority for Moz or PageRank for Google.
          </p>

          <p className="text-body-lg">
            We've tested 200+ leading companies across SaaS, fintech, e-commerce,
            and professional services. This creates the industry's first
            comprehensive AI visibility database.
          </p>

          <p className="text-body-lg">
            Your score doesn't just tell you "how often AI recommends you." It
            tells you:
          </p>

          <div className="space-y-2 text-lg ml-4">
            <p>
              → Where you rank in your industry (62nd percentile, 3rd of 7
              competitors, etc.)
            </p>
            <p>→ What separates you from top performers</p>
            <p>→ Which specific improvements move the needle</p>
          </div>

          <p className="text-body-lg">
            As more companies test with FoundIndex, the benchmark becomes more
            accurate and valuable—creating the definitive standard for AI
            visibility measurement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 text-center bg-accent-gray-light border-none">
            <p className="text-4xl font-bold text-primary mb-2">200+</p>
            <p className="text-lg text-secondary">Companies Tested</p>
          </Card>
          <Card className="p-8 text-center bg-accent-gray-light border-none">
            <p className="text-4xl font-bold text-primary mb-2">10,000+</p>
            <p className="text-lg text-secondary">AI Query Results</p>
          </Card>
          <Card className="p-8 text-center bg-accent-gray-light border-none">
            <p className="text-4xl font-bold text-primary mb-2">First</p>
            <p className="text-lg text-secondary">Industry Benchmark Database</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BenchmarkDatabase;
