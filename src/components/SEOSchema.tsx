const SEOSchema = () => {
  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "FoundIndex",
            url: "https://foundindex.com",
            logo: "https://foundindex.com/logo.png",
            description:
              "AI visibility diagnostic tool. Score your website 0-100 on how well AI systems understand you.",
            foundingDate: "2024",
            founder: {
              "@type": "Person",
              name: "Richa Deo",
            },
            sameAs: ["https://linkedin.com/in/richadeo"],
          }),
        }}
      />

      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />

      {/* WebPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "FoundIndex - AI Visibility Diagnostic",
            url: "https://foundindex.com",
            description: "Score your website's visibility to AI search engines like ChatGPT and Perplexity",
          }),
        }}
      />

      {/* SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
    </>
  );
};

export default SEOSchema;
