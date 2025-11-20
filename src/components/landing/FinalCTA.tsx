import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-3xl">
        <Card className="p-12 border-2 border-primary">
          <h2 className="text-editorial-md text-center mb-8">
            Ready to See Your FoundIndex?
          </h2>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleClick}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xl px-12 py-7 mb-6"
            >
              Calculate My FoundIndex
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>

            <p className="text-muted-foreground text-lg">
              Free beta • 3 tests/month on the starter plan
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FinalCTA;
