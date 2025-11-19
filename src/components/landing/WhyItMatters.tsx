const WhyItMatters = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-12">The Visibility Gap</h2>

        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-body-lg text-center mb-12">
            When a buyer asks ChatGPT "What's the best solution for [problem]?",
            the entire decision happens in the AI conversation. No Google search.
            No website visits. Just recommendations.
          </p>

          <p className="text-body-lg text-center font-bold mb-12">
            If you're not in that answer, you don't exist to them.
          </p>

          <div className="space-y-4 mb-12">
            <h3 className="text-2xl font-bold mb-6">THE DATA:</h3>
            <div className="space-y-3">
              <p className="text-lg">
                → 81% of buyers start with AI tools, not Google
              </p>
              <p className="text-lg">
                → AI traffic converts at 14.2% (vs. 2.8% organic) - 5x higher
              </p>
              <p className="text-lg">
                → 73% of businesses get ZERO AI recommendations (even with strong
                SEO)
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-body-lg">
              AI engines evaluate different signals than Google:
            </p>
            <ul className="space-y-2 text-lg">
              <li>
                • Content freshness (updated &lt;30 days = 25.7% higher
                recommendation rate)
              </li>
              <li>• Answer-first structure</li>
              <li>
                • Third-party validation (Reddit, YouTube, reviews)
              </li>
              <li>• Schema markup (45% visibility boost)</li>
            </ul>
          </div>

          <p className="text-body-lg text-center font-bold">
            FoundIndex measures all of this—then tells you exactly how to
            improve.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyItMatters;
