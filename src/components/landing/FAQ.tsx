import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
  hasLink?: boolean;
}

const FAQ = () => {
  const faqs: FAQ[] = [
    {
      question: "Who is FoundIndex for?",
      answer:
        "Perfect for: New brands (Semrush shows 'no data'), businesses entering new markets, content teams optimizing pages, agencies managing client sites. Also valuable for established brands fixing page-level structure.",
    },
    {
      question: "How is this different from SEO tools?",
      answer:
        "Traditional SEO (Semrush, Ahrefs): Backlinks, keywords → optimizes for Google. FoundIndex: Schema, content structure → optimizes for AI parsing. Complementary tools - you need both.",
    },
    {
      question: "What happens after I get my score?",
      answer:
        "You receive: (1) 0-100 score with breakdown, (2) Specific issues identified, (3) Copy-paste code fixes, (4) Priority ranking. Start with schema markup (biggest impact), then content structure.",
    },
    {
      question: "Will this guarantee AI recommendations?",
      answer:
        "No. Good structure is necessary but not sufficient. AI recommendations also depend on content quality, authority, and brand reputation. We measure IF AI can understand your structure WHEN it crawls you.",
    },
    {
      question: "Do I need to sign up?",
      answer: "No. Free during beta, no email required.",
    },
    {
      question: "Can you help rewrite my content?",
      answer:
        "Coming Q1 2026: Content rewriting service that maintains your voice while optimizing for AI readability. Based on 15+ years UX research and content strategy experience.",
    },
    {
      question: "Is this free?",
      answer:
        "Beta phase. This phase is for listening and learning.",
    },
    {
      question: "How can I give feedback?",
      answer: "Use the feedback button on results page or",
      hasLink: true,
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
                {faq.hasLink && (
                  <span> <Link to="/contact" className="text-link hover:underline">contact us</Link>.</span>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
