import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-12 text-foreground">
          What Early Users Say
        </h2>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-white dark:bg-card shadow-md rounded-xl text-center">
            {/* Decorative quotation mark */}
            <span className="text-6xl md:text-8xl text-gray-200 dark:text-gray-700 font-serif leading-none block mb-4">
              "
            </span>
            
            {/* Quote text */}
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 -mt-4">
              The AI visibility insights were very accurate, and the blog audit was on-point.
            </p>

            {/* Photo placeholder */}
            <div className="flex flex-col items-center">
              <div className="w-[60px] h-[60px] rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 mb-3" />
              
              {/* Name */}
              <p className="font-bold text-foreground">Gunishtha Doomra</p>
              
              {/* Title */}
              <p className="text-sm text-muted-foreground">FoundIndex Beta User</p>
            </div>
          </Card>

          {/* Contact CTA */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Want to share your experience?{" "}
            <Link to="/contact" className="underline hover:text-foreground transition-colors">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
