import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What does FoundIndex analyze?",
      answer:
        "We analyze how clearly AI systems can understand your business—the structure, clarity, and authority signals that affect AI visibility. Think of it as showing you how AI 'reads' your homepage.",
    },
    {
      question: "Why just the homepage?",
      answer:
        "Your homepage is where AI forms its first understanding of your business. We focus there because it's the foundation—if AI misunderstands your homepage, it won't accurately represent your full offering. Multi-page analysis launches in v2.",
    },
    {
      question: "How is this different from SEO?",
      answer:
        "SEO optimizes for search algorithms. AI visibility optimizes for comprehension. AI doesn't care about keyword density—it needs clear explanations, structured content, and credible signals.",
    },
    {
      question: "What do I get for free?",
      answer:
        "Complete homepage analysis, AI visibility score (0-100), specific recommendations on what to fix first, and insights on how AI systems interpret your content.",
    },
    {
      question: "Who built this and why?",
      answer:
        "I'm Richa Deo, a UX researcher with 14+ years of experience studying how people, content, and AI systems understand information. I built FoundIndex because businesses deserve to know why AI recommends—or ignores—them.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-editorial-lg text-center mb-16">
          Frequently asked questions
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
