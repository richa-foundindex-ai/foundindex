import { Helmet } from "react-helmet-async";

const SEOSchema = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://foundindex.com/#organization",
    "name": "FoundIndex",
    "url": "https://foundindex.com",
    "logo": "https://foundindex.com/logo.png",
    "description": "AI visibility diagnostic tool that helps websites get cited by AI search engines like ChatGPT, Perplexity, and Claude.",
    "founder": {
      "@type": "Person",
      "name": "Richa Deo",
      "url": "https://www.linkedin.com/in/richadeo/"
    },
    "sameAs": [
      "https://www.linkedin.com/in/richadeo/"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://foundindex.com/#website",
    "name": "FoundIndex",
    "url": "https://foundindex.com",
    "description": "Score your website's visibility to AI search engines. Free diagnostic tool analyzing 47+ criteria across schema markup, content structure, and semantic clarity.",
    "publisher": { "@id": "https://foundindex.com/#organization" }
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://foundindex.com/#webpage",
    "name": "FoundIndex - AI Visibility Diagnostic Tool",
    "description": "Free tool that scores how well AI search engines like ChatGPT, Perplexity, and Claude can find and cite your website. Get your AI visibility score in 60 seconds.",
    "url": "https://foundindex.com",
    "isPartOf": { "@id": "https://foundindex.com/#website" }
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FoundIndex AI Visibility Scorer",
    "url": "https://foundindex.com",
    "applicationCategory": "SEO Tool",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Diagnostic tool that analyzes websites for AI search engine visibility. Scores 47+ criteria including schema markup, semantic structure, content clarity, and authority signals.",
    "author": { "@id": "https://foundindex.com/#organization" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is FoundIndex?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FoundIndex is a free AI visibility diagnostic tool that scores how well your website can be found and cited by AI search engines like ChatGPT, Perplexity, and Claude. It analyzes 47+ criteria across schema markup, content structure, semantic clarity, and authority signals."
        }
      },
      {
        "@type": "Question",
        "name": "Is FoundIndex free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, FoundIndex is currently free during our beta period. You can test your homepage or blog posts and get full recommendations including code examples at no cost."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between SEO and AI visibility?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Traditional SEO optimizes for Google's ranking algorithm. AI visibility optimizes for AI search engines (ChatGPT, Perplexity, Claude) that don't rank pages—they cite sources. AI needs structured, clear content with proper schema markup to understand and reference your site."
        }
      },
      {
        "@type": "Question",
        "name": "How long does an AI visibility test take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "About 60 seconds. Enter your URL, and FoundIndex analyzes your page in real-time, returning a detailed score with actionable recommendations."
        }
      }
    ]
  };

  return (
    <Helmet>
      <title>FoundIndex - AI Visibility Diagnostic Tool</title>
      <meta name="description" content="Free tool that scores how well AI search engines like ChatGPT, Perplexity, and Claude can find and cite your website. Get your AI visibility score in 60 seconds." />
      <meta property="og:title" content="FoundIndex - AI Visibility Diagnostic" />
      <meta property="og:description" content="Score your website 0-100 on how well AI search engines can find and recommend you." />
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
      <meta name="twitter:description" content="Score your website 0-100 on how well AI search engines can find and recommend you." />
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
};

export default SEOSchema;
