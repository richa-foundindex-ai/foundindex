import { ContactForm } from "@/components/ContactForm";
import Header from "@/components/layout/Header";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <ContactForm />
      </div>
    </div>
  );
};

export default Contact;
