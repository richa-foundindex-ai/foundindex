import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gunishthaPhoto from "@/assets/gunishtha-doomra.jpg";
import blueNectarLogo from "@/assets/blue-nectar-logo.png";

const testimonials = [
  {
    id: 1,
    quote: "A genuinely top-tier tool. The AI visibility insights uncovered opportunities our regular SEO stack misses entirely. Clear, actionable recommendations in a space that's moving fast - this tool is ahead of the curve.",
    name: "Sanyog Jain",
    title: "Co-Founder, Blue Nectar Ayurved",
    image: blueNectarLogo,
    isPhoto: false,
    nameLink: "https://www.linkedin.com/in/sanyog/",
    titleLink: "https://www.bluenectar.co.in",
  },
  {
    id: 2,
    quote: "Surprisingly accurate insights. FoundIndex highlighted AI visibility gaps that didn't show up anywhere else. It's now part of my regular audit workflow.",
    name: "Gunishtha Doomra",
    title: "Tech Blogger & Software Developer",
    image: gunishthaPhoto,
    isPhoto: true,
    nameLink: "https://www.linkedin.com/in/gunishtha-doomra/",
    titleLink: "https://guptahimanshi.medium.com/",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-[28px] font-semibold text-center mb-8 text-[#1a365d]">
          Trusted by founders and teams building better businesses
        </h2>

        {/* Desktop/Tablet: Side by side */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white dark:bg-card shadow-md rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white dark:bg-card shadow-md rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          Want to share your experience?{" "}
          <Link to="/contact" className="underline hover:text-foreground transition-colors">
            Contact us
          </Link>
        </p>

      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: typeof testimonials[0];
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <Card className="p-6 md:p-8 bg-white dark:bg-card shadow-md rounded-xl hover:scale-[1.02] transition-transform duration-200">
      {/* Top-left avatar/logo */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`w-[60px] h-[60px] flex-shrink-0 rounded-full border border-gray-200 dark:border-gray-600 overflow-hidden flex items-center justify-center ${
            testimonial.isPhoto ? "" : "bg-white p-2"
          }`}
        >
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className={testimonial.isPhoto ? "w-full h-full object-cover" : "w-full h-full object-contain"}
          />
        </div>
        <div className="flex flex-col pt-1">
          {/* Name */}
          <a
            href={testimonial.nameLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary hover:underline transition-colors"
          >
            {testimonial.name}
          </a>
          {/* Title */}
          <a
            href={testimonial.titleLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {testimonial.title}
          </a>
        </div>
      </div>

      {/* Quote text */}
      <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        "{testimonial.quote}"
      </p>
    </Card>
  );
};

export default Testimonials;
