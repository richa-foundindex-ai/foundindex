import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  FileText, 
  Shield, 
  Search, 
  Scale,
  AlertTriangle,
  Lightbulb,
  Mail
} from "lucide-react";

const Methodology = () => {
  const factors = [
    {
      icon: MessageSquare,
      title: "Content clarity (0-25 points)",
      description: "We check if your site clearly explains:",
      items: [
        "What you do or sell",
        "Who it's for",
        "What problems you solve"
      ],
      note: "We look for natural, helpful language over keyword stuffing."
    },
    {
      icon: FileText,
      title: "Structured data (0-20 points)",
      description: "Organization signals that help AI parse information:",
      items: [
        "Schema.org markup",
        "Clear heading hierarchy (H1, H2, H3)",
        "Logical navigation",
        "Machine-readable business information"
      ]
    },
    {
      icon: Shield,
      title: "Authority signals (0-20 points)",
      description: "Trust indicators AI may use to establish credibility:",
      items: [
        "Customer reviews and testimonials",
        "Case studies with results",
        "Certifications and awards",
        "Media mentions",
        "Social proof"
      ]
    },
    {
      icon: Search,
      title: "Discoverability (0-20 points)",
      description: "Findability factors for AI queries:",
      items: [
        "FAQ sections answering direct questions",
        "Problem-solution framing",
        "Educational content",
        "Clear calls-to-action"
      ]
    },
    {
      icon: Scale,
      title: "Comparison content (0-15 points)",
      description: "Context markers that help AI position you:",
      items: [
        "Mentions of alternatives",
        "Feature comparisons",
        '"Why choose us" content',
        "Clear positioning statements"
      ]
    }
  ];

  const limitations = [
    "Actual AI recommendation frequency (we can't track real ChatGPT conversations)",
    "Your overall marketing effectiveness",
    "Traditional SEO rankings",
    "Brand awareness outside your website"
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Methodology</Badge>
          <h1 className="text-display font-bold mb-6">How FoundIndex works</h1>
          <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground">
            <p>
              FoundIndex analyzes how "AI-readable" your website is. Here's exactly what we check and why.
            </p>
            <p className="font-medium text-foreground">
              Our approach: We're not predicting whether ChatGPT will recommend you. Instead, we evaluate factors that make content easier for AI to understand and reference.
            </p>
            <p className="italic">
              Think of it like SEO, but for AI assistants.
            </p>
          </div>
        </div>

        {/* The 5 Factors */}
        <section className="mb-16">
          <h2 className="text-editorial-lg mb-12 text-center">The 5 factors we evaluate</h2>
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
                      {factor.note && (
                        <p className="text-sm text-muted-foreground italic">{factor.note}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Limitations */}
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
                  This is a directional assessment based on factors we believe matter for AI comprehension.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Vision */}
        <section className="mb-16">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex gap-4">
              <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold mb-4">Our vision</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We believe discoverability is shifting from search engines to AI assistants. FoundIndex helps you prepare for that shift by making your content more "AI-readable."
                  </p>
                  <p>
                    As AI search evolves, we'll update our methodology based on what we learn.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Contact */}
        <section className="text-center">
          <Card className="p-8 border-dashed">
            <Mail className="h-6 w-6 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Questions about our methodology?</p>
            <a 
              href="mailto:richa.x.deo@gmail.com" 
              className="text-primary hover:underline font-medium"
            >
              richa.x.deo@gmail.com
            </a>
          </Card>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/" className="text-primary hover:underline font-medium">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Methodology;
