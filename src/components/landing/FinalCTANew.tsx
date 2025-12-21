import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface FinalCTANewProps {
  onTestClick: () => void;
}

const FinalCTANew = ({ onTestClick }: FinalCTANewProps) => {
  return (
    <section className="py-16 md:py-20 bg-accent-gray-light">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="p-8 md:p-12 border-2 border-primary bg-background">
          <CardContent className="p-0 text-center">
            <h2 className="text-editorial-md mb-4">
              Ready to See How AI Sees Your Website?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get your FoundIndex Score in 60 seconds. Free. No signup. No credit card.
            </p>

            <Button
              size="lg"
              onClick={onTestClick}
              className="h-14 px-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Test Your Site Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
              See your AI visibility score, category breakdown, and 4-10 recommendations to improve.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FinalCTANew;
