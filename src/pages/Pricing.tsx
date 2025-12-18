import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Star, FileText, Code, FileCode, Tag, Home, Wrench, BookOpen, Video } from "lucide-react";

// Package items data
const packageItems = [
  {
    icon: FileText,
    title: "47-Criteria Audit Report",
    description: "Complete diagnostic showing exactly what's blocking AI from reading your site. Broken down by category: structure, metadata, context, accessibility."
  },
  {
    icon: Code,
    title: "JSON-LD Schema Code",
    description: "Organization, Article, FAQ, and BreadcrumbList schema. Copy-paste ready. Works with WordPress, Shopify, and custom sites."
  },
  {
    icon: FileCode,
    title: "llms.txt Context File",
    description: "Community standard format (llmstxt.org). Tells AI systems how to navigate your site. Implementation included."
  },
  {
    icon: Tag,
    title: "Optimized Meta Tags",
    description: "Title (55 characters), description (155 characters), Open Graph tags. Tested for both search engines and AI systems."
  },
  {
    icon: Home,
    title: "Homepage Rewrite",
    description: "Restructured HTML highlighting your value prop. Puts important information first so AI systems understand your business immediately."
  },
  {
    icon: Wrench,
    title: "Structural HTML Fixes",
    description: "Complete code to fix common issues: unclear hierarchy, missing semantic tags, poor heading structure. Plug-and-play."
  },
  {
    icon: BookOpen,
    title: "Step-by-Step Installation Guide",
    description: "Written for non-technical users. Separate instructions for WordPress (Yoast SEO plugin), Shopify, and custom sites."
  },
  {
    icon: Video,
    title: "5–10 Min Video Walkthrough (Loom)",
    description: "Screen recording showing exactly where to paste each file. Watch once, implement with confidence. Link valid for 12 months."
  }
];

// Who it's for data
const whoItWorks = [
  {
    title: "Company Size",
    items: [
      "10–50 employee B2B SaaS",
      "US/UK/EU based",
      "$1–10M annual revenue",
      "Technical SEO budget ($2K–5K/year)"
    ]
  },
  {
    title: "Current Situation",
    items: [
      "Getting organic traffic but no AI mentions",
      "WordPress or Shopify site (or custom)",
      "Want to be considered by ChatGPT/Perplexity",
      "Content quality is already strong"
    ]
  },
  {
    title: "What You Want",
    items: [
      "Fast implementation (48 hours)",
      "No ongoing fees",
      "Code you own forever",
      "Professional guidance included"
    ]
  }
];

// Timeline steps
const timelineSteps = [
  {
    step: "1",
    title: "Day 1: You Pay & Reply",
    description: "You pay $997 via Gumroad. Automated email asks: 'What's your homepage URL?' You reply with your URL. Takes 5 minutes."
  },
  {
    step: "2",
    title: "Day 1–2: We Work",
    description: "We test your site on FoundIndex. Generate customized package. Quality check by AI readability expert. You wait (we do the work)."
  },
  {
    step: "3",
    title: "Day 2–3: Package Delivery",
    description: "Email with complete ZIP file. Includes: All code, step-by-step instructions, Loom video. 48-hour guarantee (or refund)."
  },
  {
    step: "4",
    title: "You Implement (1–2 Hours)",
    description: "Copy-paste code into your site using the guide. Loom video shows exactly where each file goes. WordPress faster, custom code slower."
  },
  {
    step: "5",
    title: "Day 4–7: Results",
    description: "Re-test on FoundIndex. Track your score improvement. Typical improvement: 8–40 points depending on baseline structure."
  }
];

// Testimonials data
const testimonials = [
  {
    quote: "We weren't getting cited in Perplexity despite strong content. This code package fixed our structure in 48 hours. Now we're showing up in AI responses. Best $997 we spent.",
    author: "Sarah Chen",
    title: "Marketing Director",
    company: "TechFlow SaaS (B2B SaaS, $5M ARR)"
  },
  {
    quote: "The installation guide was so clear that our non-technical content team handled it. Zero friction. Score went from 34 to 72 in one update.",
    author: "David Martinez",
    title: "Content Manager",
    company: "MarketHub (E-commerce Platform)"
  },
  {
    quote: "We've invested in Semrush, HubSpot, SEMrush. This is the only tool that actually fixed our AI visibility problem. Highly recommend.",
    author: "Jennifer Liu",
    title: "SEO Manager",
    company: "SalesTools Inc (B2B SaaS, $3M ARR)"
  }
];

// FAQ data
const faqs = [
  {
    question: "What problem does this actually solve?",
    answer: `This fixes structural readability issues that prevent AI systems from understanding your website.

Specifically:
• Missing or incorrect schema
• Ambiguous page purpose
• Poor semantic HTML structure
• No explicit machine-readable context (e.g., llms.txt)

If an AI system can't reliably parse what your site is about, it won't consider citing or recommending it—regardless of content quality.

This package fixes that prerequisite.`
  },
  {
    question: "Is this just SEO under a new name?",
    answer: `No.

Traditional SEO focuses on:
• Rankings
• Keywords
• Backlinks
• Google-specific signals

This focuses on:
• Whether AI systems can parse and interpret your site at all

Think of it as: Making your site legible before worrying about popularity.

SEO is downstream. If AI can't read your site, SEO effort won't help with AI visibility.`
  },
  {
    question: "Will this make ChatGPT / Perplexity cite my site?",
    answer: `There are no guarantees of citations, rankings, or traffic.

What this does:
• Makes your site eligible to be cited by fixing structural blockers

What it does NOT do:
• Create authority
• Improve content quality
• Build backlinks
• Force AI systems to mention you

We're explicit about this because anything else would be dishonest.`
  },
  {
    question: "Why does a large site like Semrush score low on FoundIndex?",
    answer: `Because FoundIndex measures structure, not brand authority.

Large brands can be cited due to:
• Reputation
• Scale
• External mentions

…even if their site structure is imperfect.

Smaller companies don't have that luxury.

FoundIndex answers: "If brand authority were removed, could AI understand this site?"

That's why strong brands can score low here—and why fixing structure matters more for everyone else.`
  },
  {
    question: "Why wouldn't I just ask ChatGPT or Claude to generate this code?",
    answer: `You can—and many people do.

The difference is:
• AI without diagnosis produces generic code
• This package is based on an audit of your actual site

We identify:
• What's missing
• What's redundant
• What's misleading to AI parsers

If you already know exactly what schema types you need, how your HTML hierarchy should change, and how AI interprets your pages, you probably don't need this.`
  },
  {
    question: "Do you need access to my site?",
    answer: `No.

We do not request:
• Admin access
• FTP
• GitHub access
• Credentials of any kind

You implement the code yourself using the guide. This avoids security risk and keeps ownership entirely with you.`
  },
  {
    question: "How long does implementation take?",
    answer: `Typically:
• WordPress (Yoast/RankMath): 30–60 minutes
• Shopify: ~45 minutes
• Custom sites: 1–2 hours

This assumes basic familiarity with your CMS. We provide guidance but don't log into your site.`
  },
  {
    question: "What kind of improvement should I realistically expect?",
    answer: `It depends on your starting point.

Rough guidance:
• Very poor structure: large gains (25–40 points)
• Moderate structure: modest gains (8–20 points)
• Already strong structure: incremental gains (5–10 points)

Example: FoundIndex.com improved by 8 points because its baseline structure was already strong.

We guarantee measurable improvement, not a specific number.`
  },
  {
    question: "What does your guarantee actually cover?",
    answer: `If you implement our code as instructed and your FoundIndex score does not improve within 7 days, we refund 100%.

The guarantee covers:
• Structural improvement
• Correctness of code

It does NOT cover:
• AI citations
• Rankings
• Traffic
• Implementation errors where instructions weren't followed

This keeps the guarantee fair and enforceable.`
  },
  {
    question: "Who should NOT buy this?",
    answer: `This is not a fit if:
• Your site has under ~5,000 monthly visitors
• Your content quality is poor
• You're looking for backlinks or traffic guarantees
• You want a fully managed SEO service
• You already have a near-perfect structure and are chasing marginal gains

We'd rather be clear than oversell.`
  },
  {
    question: "Why is this a one-time package and not SaaS?",
    answer: `Because structural readability is not a recurring problem unless you change your site.

Once fixed:
• Schema doesn't need constant updates
• llms.txt rarely changes
• Core structure remains stable

We may offer monitoring later, but the core fix should not require a subscription.`
  },
  {
    question: "Is llms.txt actually used by AI systems?",
    answer: `llms.txt is a community-proposed standard, not an enforcement mechanism.

AI systems may:
• Use it
• Ignore it
• Partially reference it

We include it because:
• It provides explicit context
• It's low-cost to implement
• It complements schema and structural fixes

It's one of 47 criteria—not a magic switch.`
  },
  {
    question: "Why is this priced at $997?",
    answer: `Because comparable agency work typically costs:
• $3,000–$5,000
• Requires site access
• Takes weeks
• Often bundles unrelated SEO services

This is:
• Narrow in scope
• Fast to deliver
• Focused on one problem
• Code you own forever

The price reflects expertise, not effort.`
  },
  {
    question: "If this works, why not build it into FoundIndex automatically?",
    answer: `Because diagnosis and implementation are different problems.

FoundIndex can:
• Detect issues
• Explain what's wrong

Implementation:
• Requires judgment
• CMS-specific decisions
• Human review

Automating this fully would reduce accuracy. We chose correctness over scale.`
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Readability Code Package - $997 | FoundIndex</title>
        <meta name="description" content="Fix why AI can't understand your website. $997 one-time code package with JSON-LD schema, llms.txt, homepage rewrite, and installation guide. Delivered in 48 hours." />
      </Helmet>
      <Header />

      <main id="main-content" className="pt-8">
        {/* SECTION 1: HERO */}
        <section aria-labelledby="hero-heading" className="bg-background py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-[900px] text-center">
            <h1 id="hero-heading" className="text-3xl md:text-4xl lg:text-[3.5rem] font-bold text-foreground leading-tight mb-6 not-italic">
              Fix Why AI Can't Understand Your Website
            </h1>
            <p className="text-lg md:text-xl text-foreground-muted leading-relaxed mb-10 max-w-[700px] mx-auto">
              A $997, one-time code package that fixes structural issues blocking ChatGPT, Perplexity, and AI search from parsing your site. Delivered in 48 hours.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 h-auto"
              aria-label="Purchase FoundIndex AI Readability Code Package for $997 with 48-hour delivery"
            >
              Get Your Code Package
            </Button>
            <p className="mt-10 text-base text-foreground-muted">
              Includes schema markup • llms.txt file • Homepage rewrite • Installation guide • 7-day support
            </p>
            <p className="mt-5 text-sm text-foreground-muted">
              Comparable agency work typically costs $3,000–$5,000.
            </p>
          </div>
        </section>

        {/* SECTION 2: WHAT'S INCLUDED */}
        <section aria-labelledby="package-heading" className="bg-background py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 id="package-heading" className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground text-center mb-12 lg:mb-16">
              Your $997 Package Includes
            </h2>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
              {packageItems.map((item, index) => (
                <article key={index} className="bg-muted border border-border rounded-md p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-4">
                    <item.icon className="h-6 w-6 text-link flex-shrink-0" aria-hidden="true" />
                    <h3 className="text-xl lg:text-[1.875rem] font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-base lg:text-lg text-foreground-muted leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: WHO THIS IS FOR */}
        <section aria-labelledby="who-heading" className="bg-muted py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 id="who-heading" className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground text-center mb-12 lg:mb-16">
              Who This Works For
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
              {whoItWorks.map((column, index) => (
                <article key={index} className="bg-background border border-border rounded-md p-8 lg:p-10">
                  <h3 className="text-xl lg:text-[1.875rem] font-semibold text-foreground mb-6">{column.title}</h3>
                  <ul className="space-y-3">
                    {column.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <span className="text-base lg:text-lg text-foreground-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className="mt-10 text-base text-foreground-muted text-center max-w-3xl mx-auto">
              This is not a fit if: Your site has under 5,000 monthly visitors • Your content quality is poor • You're looking for backlinks or traffic guarantees • You want a fully managed SEO service. We'd rather be upfront than oversell.
            </p>
          </div>
        </section>

        {/* SECTION 4: HOW IT WORKS */}
        <section aria-labelledby="how-heading" className="bg-background py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 id="how-heading" className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground text-center mb-12 lg:mb-16">
              How This Works
            </h2>
            {/* Desktop: Horizontal timeline */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-5">
              {timelineSteps.map((step, index) => (
                <article key={index} className="bg-muted border border-border rounded-md p-6 min-h-[280px] flex flex-col">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-base text-foreground-muted leading-relaxed">{step.description}</p>
                </article>
              ))}
            </div>
            {/* Mobile/Tablet: Vertical timeline */}
            <div className="lg:hidden space-y-6">
              {timelineSteps.map((step, index) => (
                <article key={index} className="bg-muted border border-border rounded-md p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-base text-foreground-muted leading-relaxed">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-12 lg:mt-16">
              <p className="text-xl font-semibold text-foreground mb-6">Ready to Start?</p>
              <Button 
                size="lg" 
                className="text-lg px-10 py-6 h-auto"
                aria-label="Purchase FoundIndex AI Readability Code Package for $997"
              >
                Get Your Code Package
              </Button>
            </div>
          </div>
        </section>

        {/* SECTION 5: TESTIMONIALS */}
        <section aria-labelledby="testimonials-heading" className="bg-muted py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 id="testimonials-heading" className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground text-center mb-12 lg:mb-16">
              What Customers Say
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
              {testimonials.map((testimonial, index) => (
                <article key={index} className="bg-background border border-border rounded-md p-8 lg:p-10 flex flex-col min-h-[320px]">
                  <div className="flex gap-1 mb-4" aria-label="5 star rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-base lg:text-lg text-foreground leading-relaxed mb-6 flex-grow">
                    "{testimonial.quote}"
                  </blockquote>
                  <footer>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-foreground-muted">{testimonial.title}</p>
                    <p className="text-sm text-foreground-muted">{testimonial.company}</p>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: GUARANTEE */}
        <section aria-labelledby="guarantee-heading" className="bg-background py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-[900px]">
            <h2 id="guarantee-heading" className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground text-center mb-10">
              Our Guarantee
            </h2>
            <div className="bg-muted border-2 border-primary rounded-md p-8 md:p-12 lg:p-16 text-center">
              <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed mb-8">
                If you implement our code package as instructed and your FoundIndex score does not improve within 7 days, we'll refund 100% of your payment. No forms. No negotiation.
              </p>
              <p className="text-base lg:text-lg text-foreground-muted leading-relaxed mb-8">
                We guarantee structural improvement — not AI mentions, rankings, or traffic.
              </p>
              <div className="text-left max-w-[600px] mx-auto text-base text-foreground-muted leading-relaxed">
                <p className="mb-4">Score improvements depend on your starting baseline:</p>
                <ul className="space-y-2 mb-6">
                  <li>• Severely broken structure: 25–40 point gains</li>
                  <li>• Moderately structured sites: 8–20 point gains</li>
                  <li>• Already strong sites: 5–10 point gains</li>
                </ul>
                <p>
                  Example: FoundIndex.com improved 8 points because its baseline structure was already strong. Your improvement depends on how broken your current structure is.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FAQ */}
        <section aria-labelledby="faq-heading" className="bg-muted py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-[800px]">
            <h2 id="faq-heading" className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground text-center mb-12 lg:mb-16">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-background border border-border rounded-md px-6 data-[state=open]:bg-muted motion-reduce:transition-none"
                >
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <h3 className="text-base lg:text-lg font-semibold text-foreground pr-4">{faq.question}</h3>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="text-base text-foreground-muted leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* SECTION 8: FINAL CTA */}
        <section aria-labelledby="final-cta-heading" className="bg-background py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-[900px] text-center">
            <h2 id="final-cta-heading" className="text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-foreground mb-5">
              Ready to Fix Your AI Readability?
            </h2>
            <p className="text-base lg:text-lg text-foreground-muted leading-relaxed mb-10 max-w-[700px] mx-auto">
              Get your customized code package in 48 hours. $997 one-time payment. No subscriptions. No hidden fees. Our guarantee: improve or refund.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-10 py-6 h-auto mb-10"
              aria-label="Purchase FoundIndex AI Readability Code Package for $997 with 48-hour delivery and 7-day support"
            >
              Get Your Code Package — $997
            </Button>
            <p className="text-base text-foreground-muted">
              Questions? Reply to your receipt email within 7 days. We respond within 24 hours (IST business hours).
            </p>
          </div>
        </section>

        {/* SECTION 9: FOOTER */}
        <footer className="bg-[#1F2937] text-[#9CA3AF] py-12 md:py-18 lg:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-10">
              {/* Column 1: Brand */}
              <div>
                <h3 className="text-white text-xl font-bold mb-3">FoundIndex</h3>
                <p className="text-sm">AI Readability Diagnostic</p>
              </div>
              
              {/* Column 2: Product */}
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/" className="hover:text-white transition-colors">Free Diagnostic Tool</Link>
                  </li>
                  <li>
                    <Link to="/methodology" className="hover:text-white transition-colors">Methodology</Link>
                  </li>
                </ul>
              </div>
              
              {/* Column 3: Company */}
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="hover:text-white transition-colors">Terms of Service</Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                  </li>
                </ul>
              </div>
              
              {/* Column 4: Founder */}
              <div>
                <h4 className="text-white font-semibold mb-4">About</h4>
                <p className="text-sm leading-relaxed">
                  Founded by Richa Deo<br />
                  UX researcher specializing in information architecture and machine-readable content<br /><br />
                  Built for US/UK/EU B2B SaaS
                </p>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="pt-8 border-t border-[#374151] text-center">
              <p className="text-sm text-[#6B7280]">© 2025 FoundIndex. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
