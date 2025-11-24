import { ContactForm } from "@/components/ContactForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto">
        <div className="py-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <ContactForm />
      </div>
    </div>
  );
};

export default Contact;
