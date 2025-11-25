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
      question: "What does FoundIndex measure?",
      answer:
        "FoundIndex evaluates five AI-critical factors: content clarity, information discoverability, authority signals, technical structure, and differentiation clarity. These reflect how major AI systems interpret, extract, and reason about website content.",
    },
    {
      question: "Why do you only analyze the homepage?",
      answer:
        "AI models treat your homepage as the primary source of meaning. If clarity breaks here, AI rarely infers deeper pages. (Multi-page analysis coming in v2.)",
    },
    {
      question: "Is this the same as SEO?",
      answer:
        "No. SEO optimizes for ranking algorithms. AI visibility optimizes for meaning extraction, clarity, and comprehension. Think of it like SEO, but for AI assistants.",
    },
    {
      question: "How accurate is the score?",
      answer:
        "Scores may vary ±5-10 points between tests—this is normal with AI-powered analysis. FoundIndex is a directional assessment based on factors we believe matter for AI comprehension.",
    },
    {
      question: "What do I get for free?",
      answer:
        "AI Visibility Score, diagnostic breakdown across all 5 categories, and your top 3 improvement priorities.",
    },
    {
      question: "Who built this?",
      answer:
        "FoundIndex was created by Richa Deo—a UX researcher with 14+ years of experience, focused on how AI interprets and classifies information.",
    },
    {
      question: "How many tests can I run?",
      answer:
        "3 tests per week per device. The limit resets automatically 7 days after your first test. If you test the same URL twice, we'll show you the previous score.",
    },
    {
      question: "Do you store my website content?",
      answer:
        "No. We analyze your homepage and store only the URL, scores, and recommendations. We never store your HTML or website content.",
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
                  <span> See our <Link to="/privacy" className="text-link hover:underline">Privacy Policy</Link> for details.</span>
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
