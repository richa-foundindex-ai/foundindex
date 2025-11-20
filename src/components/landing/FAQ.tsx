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
        "A 0-100 score measuring how often AI engines recommend your brand when buyers ask for solutions.",
    },
    {
      question: "Why should I care?",
      answer:
        "AI assistants are becoming a primary way buyers discover new tools and services. If you're not mentioned there, you may never be considered.",
    },
    {
      question: "How is this different from SEO?",
      answer:
        "SEO focuses on search engine rankings and clicks. FoundIndex looks at whether AI assistants actually mention and recommend you in their answers.",
    },
    {
      question: "How do you calculate my score?",
      answer:
        "We run a set of standardized buyer-style queries through AI models and measure how often you appear and how clearly you're described.",
    },
    {
      question: "Can I improve my score?",
      answer:
        "Yes. Clear, specific, and helpful content that matches real buyer questions tends to perform better in AI answers.",
    },
    {
      question: "How often should I check?",
      answer:
        "AI models change frequently. Many teams choose to check monthly or after major content changes.",
    },
    {
      question: "What's a good score?",
      answer:
        "Higher scores mean you're being recommended more often. Over time, we'll share more context about how scores typically distribute by category.",
    },
    {
      question: "How accurate is this?",
      answer:
        "We use direct API calls and a consistent testing setup so results reflect what a new buyer might see when they ask similar questions.",
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
