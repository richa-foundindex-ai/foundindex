import { Card, CardContent } from "@/components/ui/card";
import { Building2, ShoppingCart, Briefcase, FileText, Megaphone } from "lucide-react";

const WhoShouldUse = () => {
  const audiences = [
    {
      icon: Building2,
      title: "B2B SaaS Companies",
      description: "Your customers research solutions on ChatGPT and Perplexity. Be the answer they find."
    },
    {
      icon: ShoppingCart,
      title: "E-Commerce Sites",
      description: "AI shopping assistants are coming. Ensure your products are visible and recommended."
    },
    {
      icon: Briefcase,
      title: "Agencies & SEO Professionals",
      description: "Add AI visibility audits to your service offerings. Differentiate your agency."
    },
    {
      icon: FileText,
      title: "Content Publishers",
      description: "Blogs and publications lose traffic if AI can't understand and cite their content."
    },
    {
      icon: Megaphone,
      title: "Marketing Teams",
      description: "Measure whether your homepage actually sells your product to AI systems."
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-accent-gray-light">
      <div className="container mx-auto px-4">
        <h2 className="text-editorial-lg text-center mb-12">
          FoundIndex is Built For
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {audiences.map((audience, index) => (
            <Card key={index} className="border-2 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <audience.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{audience.title}</h3>
                <p className="text-muted-foreground">{audience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoShouldUse;
