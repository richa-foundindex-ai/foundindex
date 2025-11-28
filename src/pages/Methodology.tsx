import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { analytics } from "@/utils/analytics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Methodology = () => {
  const navigate = useNavigate();
  const [resultsUrl, setResultsUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    analytics.pageView('methodology');
    
    // Check if user came from results page
    const storedResultsUrl = sessionStorage.getItem('foundindex_results_url');
    if (storedResultsUrl) {
      setResultsUrl(storedResultsUrl);
    }
  }, []);

  const handleBackClick = () => {
    if (resultsUrl) {
      navigate(resultsUrl);
    } else {
      navigate('/');
    }
  };

  const homepageAudit = [
    {
      category: "Value Proposition (30 points)",
      criteria: [
        "Clear explanation of what you do/sell",
        "Target audience explicitly stated",
        "Problem you solve is articulated",
        "Unique value proposition visible above fold",
        "Natural, helpful language (not keyword stuffing)",
        "Benefit-focused messaging"
      ]
    },
    {
      category: "Authority Signals (25 points)",
      criteria: [
        "Customer testimonials or reviews",
        "Case studies with measurable results",
        "Industry certifications or awards",
        "Media mentions or press coverage",
        "Social proof (client logos, user counts)",
        "Expert credentials or team expertise"
      ]
    },
    {
      category: "Competitive Positioning (20 points)",
      criteria: [
        "Comparison to alternatives mentioned",
        "Feature differentiation clearly stated",
        "\"Why choose us\" content present",
        "Clear positioning statements",
        "Competitor awareness demonstrated"
      ]
    },
    {
      category: "Discoverability (15 points)",
      criteria: [
        "FAQ section with direct answers",
        "Problem-solution framing",
        "Clear calls-to-action",
        "Logical site navigation"
      ]
    },
    {
      category: "Technical SEO (10 points)",
      criteria: [
        "Schema.org markup implemented",
        "Proper heading hierarchy (H1, H2, H3)",
        "Machine-readable business info",
        "Clean URL structure"
      ]
    }
  ];

  const blogPostAudit = [
    {
      category: "Answer Structure (30 points)",
      criteria: [
        "Direct answer in first paragraph",
        "Question addressed in H1",
        "Key takeaways summarized upfront",
        "Logical flow from problem to solution",
        "Actionable advice provided",
        "Examples and specifics included"
      ]
    },
    {
      category: "Scannability (25 points)",
      criteria: [
        "Short paragraphs (2-4 sentences)",
        "Descriptive subheadings every 200-300 words",
        "Bulleted or numbered lists used",
        "Bold text highlights key points",
        "Visual hierarchy clear",
        "White space utilized effectively"
      ]
    },
    {
      category: "FAQ & Schema (20 points)",
      criteria: [
        "FAQ section with related questions",
        "FAQ schema markup implemented",
        "Article schema present",
        "Author information included",
        "Publish/update dates visible"
      ]
    },
    {
      category: "Expertise Signals (15 points)",
      criteria: [
        "Author credentials displayed",
        "Original research or data cited",
        "Sources and references linked",
        "Experience/expertise demonstrated",
        "Real-world examples provided"
      ]
    },
    {
      category: "Technical Optimization (10 points)",
      criteria: [
        "Meta description optimized",
        "Images with descriptive alt text",
        "Internal linking to related content",
        "Mobile-friendly formatting"
      ]
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {resultsUrl ? "Back to your results" : "Back to home"}
          </Button>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-display font-bold mb-4">Methodology</h1>
          <p className="text-xl text-muted-foreground mb-8">How We Calculate Your FI Score™</p>
          <div className="max-w-3xl mx-auto text-lg text-muted-foreground">
            <p>
              FoundIndex evaluates 18 core criteria by analyzing specific signals that determine whether AI search engines can find, understand, and cite your content.
            </p>
          </div>
        </div>

        <Card className="mb-16 p-8 bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-6">Research Foundation</h2>
          <p className="text-muted-foreground mb-4">
            Our methodology is based on:
          </p>
          <div className="space-y-3 ml-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Microsoft's AI Search Optimization Guidelines (2025)</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Neil Patel's Generative Engine Optimization framework</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Analysis of AI citation patterns</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Real-world testing and validation</span>
            </div>
          </div>
        </Card>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Audit Criteria</h2>
          
          {/* Homepage Audit */}
          <Card className="mb-8 p-8">
            <h3 className="text-2xl font-bold mb-6">Homepage Audit (18 criteria)</h3>
            <Accordion type="single" collapsible className="w-full">
              {homepageAudit.map((section, index) => (
                <AccordionItem key={index} value={`homepage-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold">
                    {section.category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 mt-2">
                      {section.criteria.map((criterion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {/* Blog Post Audit */}
          <Card className="p-8">
            <h3 className="text-2xl font-bold mb-6">Blog Post Audit (18 criteria)</h3>
            <Accordion type="single" collapsible className="w-full">
              {blogPostAudit.map((section, index) => (
                <AccordionItem key={index} value={`blog-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold">
                    {section.category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 mt-2">
                      {section.criteria.map((criterion, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>

        <div className="text-center mt-12">
          <Button
            variant="link"
            onClick={handleBackClick}
            className="text-link hover:underline font-medium"
          >
            ← {resultsUrl ? "Back to your results" : "Back to home"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Methodology;
