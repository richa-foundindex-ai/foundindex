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
          <h2 className="text-editorial-md text-center mb-4">
            Ready to see your score?
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-8">
            Be among the first to test
          </p>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleClick}
              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xl px-12 py-7"
            >
              Analyze my website
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FinalCTA;
