import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, FileText, Shield, Search, Scale, AlertTriangle, Mail } from "lucide-react";
import Header from "@/components/layout/Header";

const Methodology = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const factors = [
    {
      icon: MessageSquare,
      title: "Content Clarity (0-30 points)",
      description: "Value proposition explicitness. We check if your site clearly explains:",
      items: ["What you do or sell", "Who it's for", "What problems you solve"],
      note: "We look for natural, helpful language over keyword stuffing.",
    },
    {
      icon: Search,
      title: "Information Discoverability (0-25 points)",
      description: "Key detail accessibility. Findability factors for AI queries:",
      items: [
        "FAQ sections answering direct questions",
        "Problem-solution framing",
        "Educational content",
        "Clear calls-to-action",
      ],
    },
    {
      icon: Shield,
      title: "Authority Signals (0-15 points)",
      description: "Credibility verification markers. Trust indicators AI may use to establish credibility:",
      items: [
        "Customer reviews and testimonials",
        "Case studies with results",
        "Certifications and awards",
        "Media mentions",
        "Social proof",
      ],
    },
    {
      icon: FileText,
      title: "Technical Structure (0-15 points)",
      description: "Machine-readable optimization. Organization signals that help AI parse information:",
      items: [
        "Schema.org markup",
        "Clear heading hierarchy (H1, H2, H3)",
        "Logical navigation",
        "Machine-readable business information",
      ],
    },
    {
      icon: Scale,
      title: "Competitive Positioning (0-15 points)",
      description: "Differentiation clarity. Context markers that help AI position you:",
      items: [
        "Mentions of alternatives",
        "Feature comparisons",
        '"Why choose us" content',
        "Clear positioning statements",
      ],
    },
  ];

  const limitations = [
    "Actual AI recommendation frequency (we can't track real ChatGPT conversations)",
    "Your overall marketing effectiveness",
    "Traditional SEO rankings",
    "Brand awareness outside your website",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Methodology
          </Badge>
          <h1 className="text-display font-bold mb-6">How FoundIndex works</h1>
          <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground">
            <p>FoundIndex measures AI comprehension across 5 critical factors. Research-backed methodology. Validated on real websites.</p>
            <p className="font-medium text-foreground">
              This diagnostic evaluates structural elements that determine AI recommendation probability.
            </p>
            <p className="italic">AI visibility = SEO for conversational search engines.</p>
          </div>
        </div>

        <Card className="mb-16 p-8 bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-6">Research Foundation</h2>
          <p className="text-muted-foreground mb-6">
            FoundIndex methodology developed through structured research conducted November 2025.
          </p>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Research Process</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Systematic analysis across 5 AI systems</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We conducted structured evaluations using Claude, ChatGPT, Perplexity, Gemini, and DeepSeek. Each system received identical prompts to observe how they interpret website content, extract meaning, and identify offerings, audiences, and credibility.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Pattern identification</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We documented consistent failures across all systems: unclear value propositions, missing service descriptions, no audience definition, weak authority proof, poor heading structure, and inconsistent terminology. These patterns emerged independently across all five systems.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Real-world validation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    We scored diverse websites using our rubrics and tested each with standardized questions. Clear correlation emerged:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Sites scoring 70+ produced accurate AI descriptions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Sites scoring &lt;40 resulted in declined recommendations</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Example validation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    Website scoring 43/100 (Poor AI Visibility) tested with ChatGPT:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span>Result: AI unable to answer 9/10 basic questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      <span>Conclusion: "Would not recommend based on available information"</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3 italic">
                    Predicted outcome matched actual AI behavior.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Research Documentation</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Full research summary (25+ pages)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Detailed scoring rubrics (all 5 categories)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Validation study results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Research citations (Schema.org, Google E-E-A-T guidelines, GEO research)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-16 p-8 bg-accent-gray-light border-border">
          <h3 className="text-xl font-bold mb-6">What does "AI-readable" mean?</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-destructive mb-2">Example 1 - Not AI-readable:</p>
              <p className="text-muted-foreground italic">
                "Best travel tips top destinations affordable luxury adventure explore discover amazing"
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-success mb-2">Example 2 - AI-readable:</p>
              <p className="text-foreground">
                "We're a travel blog focused on adventure travel in Southeast Asia. We share practical tips for solo
                travelers, budget recommendations, and hidden destinations."
              </p>
            </div>
            <p className="text-sm text-muted-foreground pt-4 border-t border-border">
              When someone asks ChatGPT "What are good travel blogs for Asia?", the second example is easy for AI to
              understand and recommend.
            </p>
          </div>
        </Card>

        <section className="mb-16">
          <h2 className="text-editorial-lg mb-12 text-center">The 5 Factors We Measure</h2>
          <div className="space-y-8">
            {factors.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <Icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{factor.title}</h3>
                      <p className="text-muted-foreground mb-4">{factor.description}</p>
                      <ul className="space-y-2 mb-4">
                        {factor.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                      {factor.note && <p className="text-sm text-muted-foreground italic">{factor.note}</p>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-16">
          <Card className="p-8 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <div className="flex gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold mb-4">What this doesn't measure</h2>
                <ul className="space-y-2">
                  {limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-500 mt-1">•</span>
                      <span className="text-muted-foreground">{limitation}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-muted-foreground italic">
                  This is a directional assessment based on factors that determine AI recommendation likelihood.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="text-center">
          <Card className="p-8 border-dashed">
            <Mail className="h-6 w-6 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Questions about our methodology?</h2>
            <Button variant="default" asChild>
              <Link to="/contact">Contact us</Link>
            </Button>
          </Card>
        </section>

        <div className="text-center mt-12">
          <Link to="/" className="text-link hover:underline font-medium">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Methodology;
