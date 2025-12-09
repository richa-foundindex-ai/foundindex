import { Helmet } from "react-helmet-async";

const SEOSchema = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FoundIndex",
    url: "https://foundindex.com",
    logo: "https://foundindex.com/logo.png",
    description: "AI visibility diagnostic tool for websites",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Richa Deo",
    },
    sameAs: ["https://linkedin.com/in/richadeo"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FoundIndex",
    url: "https://foundindex.com",
    description:
      "Free AI visibility diagnostic. Test how well ChatGPT, Claude, and Perplexity understand your website.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://foundindex.com/?url={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "FoundIndex - AI Visibility Diagnostic",
    url: "https://foundindex.com",
    description: "Score your website's visibility to AI search engines like ChatGPT and Perplexity",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FoundIndex",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: "AI visibility diagnostic tool. Score websites 0-100 on AI readability.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is AI visibility?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI visibility measures how well AI systems like ChatGPT understand and recommend your business.",
        },
      },
      {
        "@type": "Question",
        name: "How does FoundIndex work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FoundIndex analyzes your website across 5 factors: content clarity, information discoverability, authority signals, technical structure, and competitive positioning.",
        },
      },
      {
        "@type": "Question",
        name: "How often can I retest?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each URL can be retested after 7 days.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data stored?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We store URL, scores, and recommendations. No full HTML or personal data.",
        },
      },
    ],
  };

  return (
    <Helmet>
      <title>FoundIndex - AI Visibility Diagnostic Tool</title>
      <meta
        name="description"
        content="Score your website's visibility to AI search engines like ChatGPT and Perplexity. Get your AI visibility score in 60 seconds."
      />
      <meta property="og:title" content="FoundIndex - AI Visibility Diagnostic" />
      <meta
        property="og:description"
        content="Score your website 0-100 on how well AI search engines can find and recommend you."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://foundindex.com" />
      <meta property="og:image" content="https://foundindex.com/og-image.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content="FoundIndex - AI Visibility Diagnostic Tool" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://foundindex.com/og-image.png" />
      <meta name="twitter:image:alt" content="FoundIndex - AI Visibility Diagnostic Tool" />
      <meta name="twitter:title" content="FoundIndex - AI Visibility Diagnostic" />
      <meta
        name="twitter:description"
        content="Score your website 0-100 on how well AI search engines can find and recommend you."
      />
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
};

export default SEOSchema;
