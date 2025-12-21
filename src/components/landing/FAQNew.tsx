import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQNew = () => {
  const faqs = [
    {
      question: "How is this different from SEO?",
      answer: "SEO optimizes for Google's search algorithm. FoundIndex optimizes for AI systems like ChatGPT, Perplexity, and Claude. These systems parse and understand content differently than traditional search crawlers."
    },
    {
      question: "Which AI systems does FoundIndex measure?",
      answer: "FoundIndex analyzes how ChatGPT, Perplexity, Claude, Gemini, and DeepSeek would interpret and understand your website. Our scoring criteria are based on common factors across all major AI systems."
    },
    {
      question: "What's a good score?",
      answer: "85+ is excellent — AI systems can clearly understand and recommend you. 70-84 is competitive — you're visible but have room to improve. Below 70 needs work — AI may struggle to understand or recommend your site."
    },
    {
      question: "How often should I retest?",
      answer: "After making changes, wait 1-2 weeks and retest to see improvements. Once optimized, test monthly to maintain your score and catch any regressions."
    },
    {
      question: "Can I improve without a developer?",
      answer: "Yes! Most fixes are content and structure-based. You can improve your value proposition clarity, add testimonials, restructure headings, and update meta descriptions without touching code."
    },
    {
      question: "What if I rank #1 on Google?",
      answer: "Great for traditional SEO, but AI visibility is separate. AI systems don't rank pages — they recommend solutions based on how clearly your site answers questions. Many #1 Google sites score poorly on AI visibility."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We're GDPR compliant, don't sell your data, and only analyze publicly accessible pages. Your URL and score are stored securely and never shared with third parties."
    },
    {
      question: "How long does testing take?",
      answer: "About 60 seconds. We analyze your page structure, content clarity, schema markup, and authority signals in real-time using our AI-powered analysis engine."
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-editorial-lg text-center mb-12">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-left font-semibold py-4 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQNew;
