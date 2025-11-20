import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

const BetaTransparency = () => {
  return (
    <section className="py-20 px-4 bg-accent-gray-light">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Badge variant="outline" className="text-base px-4 py-2">
            Beta
          </Badge>
          <h2 className="text-editorial-lg text-center">
            Built with transparency
          </h2>
        </div>

        <Card className="p-8 bg-background border-l-4 border-l-primary">
          <div className="flex gap-4">
            <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                FoundIndex is currently in beta. We're testing and improving our analysis based on user feedback.
              </p>
              <p>
                Our analysis is not a guarantee of AI recommendation. It's a directional assessment of factors we've identified as important for AI comprehension.
              </p>
              <p className="font-medium text-foreground">
                Results are free while in beta. We're learning alongside you.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default BetaTransparency;
