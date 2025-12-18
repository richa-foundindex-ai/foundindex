import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is this for?",
    answer: "B2B SaaS, content publishers, e-commerce sites—anyone wanting AI citations. If you have a dev team or can follow technical instructions, you can implement our code."
  },
  {
    question: "Do you need access to my site?",
    answer: "No. We deliver complete code packages. You (or your developer) implement. Zero security risk, full control."
  },
  {
    question: "What platforms?",
    answer: "WordPress, Shopify, Webflow, Wix, custom sites. Includes platform-specific instructions."
  },
  {
    question: "How long to implement?",
    answer: "2-4 hours for developers, 4-6 hours DIY. We deliver code within 48 hours of payment."
  },
  {
    question: "Can I do this without a developer?",
    answer: "Yes if you're comfortable with WordPress plugins or basic HTML. Video guides show exactly where to paste. Complex custom sites may need dev help."
  }
];

const FAQ = () => {
  return (
    <section 
      className="py-20 bg-gray-50"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 
          id="faq-heading"
          className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
        >
          Common Questions
        </h2>

        <Accordion 
          type="single" 
          collapsible 
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`faq-${index}`}
              className="bg-white border border-gray-200 rounded-xl px-6 data-[state=open]:bg-gray-50 transition-colors hover:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2"
            >
              <AccordionTrigger 
                className="text-left py-5 text-lg font-semibold text-gray-900 hover:no-underline focus:outline-none [&[data-state=open]>span]:rotate-45 [&>svg]:hidden"
                aria-label={`${faq.question} - Click to ${index === 0 ? 'expand' : 'toggle'} answer`}
              >
                <h3 className="pr-4">{faq.question}</h3>
                <span 
                  aria-hidden="true" 
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 transition-transform duration-200"
                >
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 14 14" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="transition-transform duration-200"
                  >
                    <line x1="7" y1="0" x2="7" y2="14" />
                    <line x1="0" y1="7" x2="14" y2="7" className="[[data-state=open]_&]:opacity-0 transition-opacity" />
                  </svg>
                </span>
              </AccordionTrigger>
              <AccordionContent 
                className="text-gray-600 pb-5 motion-reduce:transition-none"
              >
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
