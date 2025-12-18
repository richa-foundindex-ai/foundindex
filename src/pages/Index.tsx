import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/layout/Navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import blueNectarLogo from "@/assets/blue-nectar-logo.png";
import nitinPhoto from "@/assets/nitin-kaura.jpg";
import gunishthaPhoto from "@/assets/gunishtha-doomra.jpg";

const Index = () => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (websiteUrl.trim()) {
      const normalizedUrl = websiteUrl.startsWith("http://") || websiteUrl.startsWith("https://")
        ? websiteUrl
        : `https://${websiteUrl}`;
      navigate(`/results?url=${encodeURIComponent(normalizedUrl)}`);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Helmet>
        <title>FoundIndex | Fix Why AI Can't Read Your Website</title>
        <meta name="description" content="Free diagnostic to see why AI systems can't understand your site. Professional code package to fix it. 48-hour delivery." />
      </Helmet>

      <Navigation onScrollToSection={scrollToSection} />

      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Is AI Ignoring Your Website?
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-3xl mx-auto">
              Test if ChatGPT, Perplexity, and Google AI can actually understand your site. Get your AI Readability Score in 60 seconds.
            </p>

            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Analyzes 47 structural criteria including schema markup, llms.txt, semantic HTML, and content clarity
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={() => scrollToSection("free-tool")}
                className="bg-white text-violet-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                aria-label="Test your website for AI readability - Free diagnostic in 60 seconds"
              >
                Test Your Site Free
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="border-2 border-white/50 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
                aria-label="View code package details - $997 professional AI readability implementation"
              >
                See Code Package - $997 →
              </button>
            </div>

            <p className="text-white/70 text-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No signup required • Instant results
            </p>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
              Your Content Is Invisible to AI
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* The Shift */}
              <div className="bg-white rounded-2xl p-8 shadow-sm card-hover">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">The Shift</h3>
                <p className="text-gray-600">
                  AI-powered search (ChatGPT, Perplexity, Google AI Overviews) now answers 40% of queries directly—without sending users to your site.
                </p>
              </div>

              {/* The Problem */}
              <div className="bg-white rounded-2xl p-8 shadow-sm card-hover">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">The Problem</h3>
                <p className="text-gray-600">
                  AI systems can't understand most websites. Poor structure, missing schema, unclear purpose—your site speaks "human" but not "machine."
                </p>
              </div>

              {/* The Cost */}
              <div className="bg-white rounded-2xl p-8 shadow-sm card-hover">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">The Cost</h3>
                <p className="text-gray-600">
                  While competitors get cited by AI, you're losing traffic and authority. Every day AI can't read you is a day you're invisible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Input vs Output Comparison */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Stop Tracking Problems. Start Fixing Them.
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Most tools track IF AI mentions you. FoundIndex fixes WHY AI can't read you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Most Tools Track OUTPUT */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Most Tools Track OUTPUT</h3>
                </div>
                <p className="text-gray-600 mb-4">Tools like Semrush AI Visibility and Ahrefs Brand Radar tell you:</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">"AI cited you 3 times last month"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">"Your competitor is mentioned more"</span>
                  </div>
                </div>
                <p className="text-gray-500 italic">They track the symptom, but not the cause.</p>
              </div>

              {/* FoundIndex Fixes the INPUT */}
              <div className="bg-violet-50 rounded-2xl p-8 border-2 border-violet-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-violet-200 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-violet-900">FoundIndex Fixes the INPUT</h3>
                </div>
                <p className="text-violet-800 mb-4">We diagnose and fix the root cause:</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-violet-800">"Your site has no schema markup"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-violet-800">"Your content structure confuses AI"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-violet-800">"You're missing llms.txt context"</span>
                  </div>
                </div>
                <p className="text-violet-700 font-medium">We fix the structure so AI can read you.</p>
              </div>
            </div>

            {/* How They Work Together */}
            <div className="bg-gray-900 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold text-center mb-8">How They Work Together</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-6">
                <div className="text-center">
                  <div className="text-violet-400 text-sm font-medium mb-1">STEP 1</div>
                  <div className="text-lg font-bold">FoundIndex</div>
                  <div className="text-gray-400 text-sm">Fix INPUT (Structure)</div>
                </div>
                <span className="text-gray-500 text-2xl hidden md:block">→</span>
                <div className="text-center">
                  <div className="text-violet-400 text-sm font-medium mb-1">STEP 2</div>
                  <div className="text-lg font-bold">Build Authority</div>
                  <div className="text-gray-400 text-sm">Content & Backlinks</div>
                </div>
                <span className="text-gray-500 text-2xl hidden md:block">→</span>
                <div className="text-center">
                  <div className="text-violet-400 text-sm font-medium mb-1">STEP 3</div>
                  <div className="text-lg font-bold">Track OUTPUT</div>
                  <div className="text-gray-400 text-sm">Semrush/Ahrefs</div>
                </div>
              </div>
              <p className="text-center text-green-400 font-medium">
                ✅ We're the prerequisite to citation tracking.
              </p>
            </div>
          </div>
        </section>

        {/* Large Sites Explanation */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              "But Large, Authoritative Sites Score Low Too"
            </h2>
            <p className="text-xl text-gray-600 text-center mb-12">
              Yes—that's exactly the point. Here's why this is common and fixable.
            </p>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Why Even Well-Known Websites Can Score Low
              </h3>

              <p className="text-gray-600 mb-6">
                FoundIndex measures structural readability—can AI parse your site without ambiguity? Not brand size or domain authority.
              </p>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Large, mature sites often have:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Legacy markup from multiple redesigns</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Heavy JavaScript rendering (hard for AI)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Mixed audiences and purposes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Built before AI search existed (2022-2025)</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 font-medium mb-8">
                Result: Even authoritative sites score 50-70. This is common—and fixable.
              </p>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">The Key Distinction:</h4>
                <p className="text-gray-600 mb-2">
                  Semrush/Ahrefs track IF AI mentions brands (output).
                </p>
                <p className="text-gray-600 mb-2">
                  FoundIndex measures IF AI can READ structure (input).
                </p>
                <p className="text-gray-700 font-medium">
                  Two different problems. Both valuable—at different stages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Free Tool Section */}
        <section id="free-tool" className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 text-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium mb-6">
              Free Tool
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Test Your AI Readability</h2>
            <p className="text-xl text-white/90 mb-8">
              Get your 0-100 score in 60 seconds. See exactly what AI systems can't understand.
            </p>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 text-left">
              <div className="mb-4">
                <label htmlFor="website-url" className="block text-gray-700 font-medium mb-2">
                  Your Website URL
                </label>
                <input
                  type="text"
                  id="website-url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900"
                  aria-required="true"
                  aria-describedby="url-helper-text"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-violet-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-violet-700 transition-colors"
                aria-label="Analyze my website for AI readability - Free diagnostic"
              >
                Analyze My Site
              </button>
            </form>

            <p id="url-helper-text" className="text-white/70 text-sm mt-4">
              Instant results • No signup • Analyzes 47 technical criteria
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="inline-block bg-violet-100 text-violet-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
                Professional Service
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">AI Readability Code Package</h2>
              <p className="text-xl text-gray-600">Complete implementation code. You install. We support.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 text-white p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Complete Code Package</h3>
                    <p className="text-gray-400">Ready-to-install with video guide</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-4xl font-bold">$997</div>
                    <div className="text-gray-400">one-time</div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">What You Receive:</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    { title: "Complete 47-criteria audit", desc: "Detailed analysis of blocking issues" },
                    { title: "JSON-LD schema code", desc: "Organization, Article, FAQ—ready to paste" },
                    { title: "llms.txt file", desc: "AI context file ready to upload" },
                    { title: "Optimized meta tags", desc: "Title, description, Open Graph" },
                    { title: "Homepage rewrite", desc: "AI-optimized content structure" },
                    { title: "Installation guide", desc: "WordPress, Shopify, custom sites" },
                    { title: "Video walkthrough", desc: "Screen recording with instructions" },
                    { title: "7-day email support", desc: "Questions answered promptly" },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">48 hours</div>
                      <div className="text-sm text-gray-500">Delivery time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">Email delivery</div>
                      <div className="text-sm text-gray-500">You implement</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">Guaranteed</div>
                      <div className="text-sm text-gray-500">Score improvement</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <a
                    href="https://foundindex.gumroad.com/l/code-package"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-violet-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-violet-700 transition-colors w-full md:w-auto"
                    aria-label="Purchase AI readability code package for $997 - Secure payment via Gumroad"
                  >
                    Get Code Package - $997
                  </a>
                  <p className="text-sm text-gray-500 mt-4">
                    Secure payment via Gumroad • Digital delivery
                  </p>
                  <p className="text-sm text-gray-500">
                    Questions?{" "}
                    <Link to="/contact" className="text-violet-600 hover:underline">
                      Chat with us
                    </Link>{" "}
                    during business hours
                  </p>
                </div>
              </div>
            </div>

            {/* Q1 2026 Notice */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-6 py-4">
                <div className="w-10 h-10 bg-violet-200 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-violet-800 font-medium">Full Implementation Service ($2,997) launching Q1 2026</div>
                  <div className="text-violet-600 text-sm">We install everything for you. Stay tuned.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Guarantee & Expectations</h2>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Money-Back Guarantee:</h3>
                  <p className="text-gray-600 mb-2">
                    Implement our code exactly as instructed. If your FoundIndex score shows zero improvement, we refund 100%.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Covers code accuracy only. Does not guarantee specific point increases (depends on baseline).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Improvement Expectations:</h3>
                  <p className="text-gray-600 mb-3">Score improvements vary by baseline:</p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-gray-700"><strong>• Severe issues (20-40):</strong> Typically 25-45 points</p>
                    <p className="text-gray-700"><strong>• Moderate issues (40-60):</strong> Typically 15-30 points</p>
                    <p className="text-gray-700"><strong>• Well-structured (60-75):</strong> May see 8-15 points</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Example: FoundIndex.com improved 8 points (73→81) from a strong baseline. Sites at 35/100 typically gain 30-40 points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Trusted by Founders and Marketers
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={blueNectarLogo}
                    alt="Blue Nectar Ayurved company logo"
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Sanyog Jain</div>
                    <div className="text-sm text-gray-500">Co-Founder, Blue Nectar Ayurved</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "A genuinely top-tier tool. The AI visibility insights uncovered opportunities our regular SEO stack misses entirely."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={nitinPhoto}
                    alt="Nitin Kaura professional headshot"
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Nitin Kaura</div>
                    <div className="text-sm text-gray-500">Full-Stack Marketer & SEO Specialist</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The breakdown was sharp and surprisingly aligned with how I evaluate pages for AEO/LLM relevance."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={gunishthaPhoto}
                    alt="Gunishtha Doomra professional headshot"
                    className="w-14 h-14 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Gunishtha Doomra</div>
                    <div className="text-sm text-gray-500">Tech Blogger & Software Developer</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Surprisingly accurate insights. FoundIndex highlighted AI visibility gaps that didn't show up anywhere else."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
              Common Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "Who is this for?",
                  a: "B2B SaaS, content publishers, e-commerce sites—anyone wanting AI citations. If you have a dev team or can follow technical instructions, you can implement our code."
                },
                {
                  q: "Do you need access to my site?",
                  a: "No. We deliver complete code packages. You (or your developer) implement. Zero security risk, full control."
                },
                {
                  q: "What platforms?",
                  a: "WordPress, Shopify, Webflow, Wix, custom sites. Includes platform-specific instructions."
                },
                {
                  q: "How long to implement?",
                  a: "2-4 hours for developers, 4-6 hours DIY. We deliver code within 48 hours of payment."
                },
                {
                  q: "Can I do this without a developer?",
                  a: "Yes if you're comfortable with WordPress plugins or basic HTML. Video guides show exactly where to paste. Complex custom sites may need dev help."
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stop Being Invisible to AI
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Test free. Get professional code if needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => scrollToSection("free-tool")}
                className="bg-violet-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-violet-700 transition-colors"
                aria-label="Test your website for AI readability - Free diagnostic"
              >
                Test Your Site Free
              </button>
              <a
                href="https://foundindex.gumroad.com/l/code-package"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
                aria-label="Purchase AI readability code package for $997"
              >
                Get Code Package - $997 →
              </a>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>

      <style>{`
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
      `}</style>
    </>
  );
};

export default Index;
