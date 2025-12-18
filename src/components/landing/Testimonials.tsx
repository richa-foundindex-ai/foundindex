import { Link } from "react-router-dom";
import gunishthaPhoto from "@/assets/gunishtha-doomra.jpg";
import blueNectarLogo from "@/assets/blue-nectar-logo.png";
import nitinPhoto from "@/assets/nitin-kaura.jpg";

const testimonials = [
  {
    id: 1,
    name: "Sanyog Jain",
    title: "Co-Founder, Blue Nectar Ayurved",
    image: blueNectarLogo,
    imageAlt: "Blue Nectar Ayurved company logo",
    isLogo: true,
    quote: "A genuinely top-tier tool. The AI visibility insights uncovered opportunities our regular SEO stack misses entirely.",
    linkedinUrl: "https://www.linkedin.com/in/sanyog/",
    companyUrl: "https://www.bluenectar.co.in",
  },
  {
    id: 2,
    name: "Nitin Kaura",
    title: "Full-Stack Marketer & SEO Specialist",
    image: nitinPhoto,
    imageAlt: "Nitin Kaura professional headshot",
    isLogo: false,
    quote: "The breakdown was sharp and surprisingly aligned with how I evaluate pages for AEO/LLM relevance.",
    linkedinUrl: "https://www.linkedin.com/in/nitinkaura/",
    companyUrl: "https://topmate.io/nitinkaura",
  },
  {
    id: 3,
    name: "Gunishtha Doomra",
    title: "Tech Blogger & Software Developer",
    image: gunishthaPhoto,
    imageAlt: "Gunishtha Doomra professional headshot",
    isLogo: false,
    quote: "Surprisingly accurate insights. FoundIndex highlighted AI visibility gaps that didn't show up anywhere else.",
    linkedinUrl: "https://www.linkedin.com/in/gunishtha-doomra/",
    companyUrl: "https://guptahimanshi.medium.com/",
  },
];

const Testimonials = () => {
  return (
    <section 
      className="py-16 md:py-24 bg-gray-50"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 
          id="testimonials-heading"
          className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800"
        >
          Trusted by Founders and Marketers
        </h2>

        {/* Testimonials Grid: 1 col mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Contact CTA */}
        <p className="text-center text-sm text-gray-500 mt-12">
          Want to share your experience?{" "}
          <Link 
            to="/contact" 
            className="underline hover:text-gray-800 transition-colors"
            aria-label="Contact FoundIndex to share your testimonial"
          >
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
    <article 
      className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Author info with image */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={testimonial.image}
          alt={testimonial.imageAlt}
          loading="lazy"
          className={`w-16 h-16 rounded-full flex-shrink-0 ${
            testimonial.isLogo 
              ? "bg-white border border-gray-200 p-2 object-contain" 
              : "object-cover"
          }`}
        />
        <div className="flex flex-col">
          <a
            href={testimonial.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${testimonial.name}'s LinkedIn profile`}
            className="font-semibold text-gray-800 hover:text-teal-600 hover:underline transition-colors"
          >
            {testimonial.name}
          </a>
          <a
            href={testimonial.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${testimonial.title} website`}
            className="text-sm text-gray-500 hover:text-teal-600 hover:underline transition-colors"
          >
            {testimonial.title}
          </a>
        </div>
      </div>

      {/* Quote */}
      <blockquote>
        <p className="text-gray-700 italic leading-relaxed">
          "{testimonial.quote}"
        </p>
      </blockquote>
    </article>
  );
};

export default Testimonials;
