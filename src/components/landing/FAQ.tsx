import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What exactly is FoundIndex?",
      answer:
        "A 0-100 score measuring how often AI engines recommend your brand, calibrated against 200+ tested companies. Like Domain Authority for AI visibility.",
    },
    {
      question: "Why should I care?",
      answer:
        "81% of buyers use AI tools. AI traffic converts at 5x higher rates (14.2% vs 2.8%). If you're not found by AI, you're missing your highest-intent prospects.",
    },
    {
      question: "How is this different from SEO?",
      answer:
        "SEO = Google rankings. FoundIndex = AI visibility. Google shows links. AI gives answers. If AI doesn't recommend you in its answer, there's no link to click.",
    },
    {
      question: "How do you calculate my score?",
      answer:
        "45 queries (real buyer questions) across ChatGPT, Claude, Perplexity. Weighted by position, context quality, query recency. Calibrated against our 200+ company benchmark database.",
    },
    {
      question: "Can I improve my score?",
      answer:
        "Yes. Top 3 improvements: content freshness (+15 pts), FAQ schema (+12 pts), Reddit presence (+10 pts). Your report includes customized roadmap.",
    },
    {
      question: "How often should I check?",
      answer:
        "Monthly. AI engines update constantly. Track your FoundIndex like web traffic to catch drops early and measure improvement.",
    },
    {
      question: "What's a good score?",
      answer:
        "0-29: Low (most sites) | 30-49: Emerging | 50-69: Strong | 70-89: Excellent | 90-100: Market leader. Industry context matters—your report shows how you compare to your specific vertical.",
    },
    {
      question: "How accurate is this?",
      answer:
        "We use official APIs (GPT-4o, Claude 3.5 Sonnet, Perplexity). Scores reflect what real buyers see. Calibrated against 10,000+ results for statistical reliability.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-16">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background px-6 rounded-lg border"
            >
              <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
