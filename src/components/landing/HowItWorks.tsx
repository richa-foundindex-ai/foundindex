import { Card } from "@/components/ui/card";

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-8">
          How FoundIndex works
        </h2>

        <Card className="p-8 bg-background border-none">
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              FoundIndex analyzes your homepage the same way AI models do—checking for the signals they rely on to understand and categorize businesses:
            </p>
            
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Core purpose:</strong> Can AI understand what you do and who you help?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Content structure:</strong> Is your offering logically organized?</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Authority signals:</strong> Testimonials, credentials, social proof</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-foreground">Technical readability:</strong> Headings, page titles, metadata</span>
              </li>
            </ul>

            <p className="font-medium text-foreground">
              You get a scored breakdown (0-100) plus specific fixes ranked by impact for your homepage.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default HowItWorks;
