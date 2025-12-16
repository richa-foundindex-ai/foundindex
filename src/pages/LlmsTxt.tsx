import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Check, 
  X, 
  Copy, 
  ChevronDown, 
  ExternalLink,
  AlertTriangle,
  FileText,
  Moon,
  Sun,
  Github,
  ArrowUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";

const techArticleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "llms.txt - A Proposed Standard for AI-Readable Websites",
  "author": {
    "@type": "Organization",
    "name": "FoundIndex",
    "url": "https://foundindex.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "FoundIndex",
    "url": "https://foundindex.com"
  },
  "datePublished": "2024-12-16",
  "dateModified": "2024-12-16",
  "description": "A machine-readable file that declares how AI systems should interpret a website's content, inspired by how robots.txt guides crawlers.",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://foundindex.com/llms-txt"
  }
};

// Mock counters - would be fetched from backend in production
const IMPLEMENTATIONS_COUNT = 34;
const VALIDATIONS_COUNT = 127;

const LlmsTxt = () => {
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(false);
  
  // Validator state
  const [validatorUrl, setValidatorUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    found: boolean;
    location?: string;
    valid?: boolean;
    errors?: string[];
    directives?: Record<string, string>;
    completenessScore?: number;
    warnings?: string[];
  } | null>(null);

  // Generator state
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorForm, setGeneratorForm] = useState({
    purpose: "",
    audience: "",
    pages: "",
    freshness: "monthly",
    email: ""
  });
  const [generatedFile, setGeneratedFile] = useState("");

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Back to Top visibility state
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle theme
  const toggleTheme = () => setIsDark(!isDark);

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, label: string = "Content") => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy manually",
        variant: "destructive",
      });
    }
  };

  // Validate llms.txt
  const handleValidate = async () => {
    if (!validatorUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a website URL to validate",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    // Simulate validation - in production this would call an edge function
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock result - would be real validation in production
    const mockResult = {
      found: Math.random() > 0.6,
      location: "/.well-known/llms.txt",
      valid: true,
      directives: {
        "version": "0.1",
        "site-purpose": "B2B SaaS for website analytics",
        "primary-audience": "Marketers, Product Managers",
        "authoritative-pages": "/docs, /pricing, /blog",
        "update-frequency": "weekly"
      },
      completenessScore: 7,
      warnings: ["Missing: contact-email", "Missing: last-updated", "Missing: language"]
    };

    if (!mockResult.found) {
      setValidationResult({
        found: false,
        warnings: ["No llms.txt file found at standard locations"]
      });
    } else {
      setValidationResult(mockResult);
    }

    setIsValidating(false);
  };

  // Generate llms.txt file
  const handleGenerate = () => {
    const { purpose, audience, pages, freshness, email } = generatorForm;
    
    if (!purpose.trim()) {
      toast({
        title: "Purpose required",
        description: "Please describe your site's purpose",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const pagesArray = pages.split('\n').filter(p => p.trim()).map(p => p.trim()).join(', ');

    const file = `# llms.txt - AI Interpretive Metadata
# Generated by FoundIndex (https://foundindex.com/llms-txt)
# Specification: https://foundindex.com/llms-txt

version: 0.1
last-updated: ${today}

# Site Context
site-purpose: ${purpose}
${audience ? `primary-audience: ${audience}` : '# primary-audience: (not specified)'}
${pagesArray ? `authoritative-pages: ${pagesArray}` : '# authoritative-pages: (not specified)'}

# Content Freshness
update-frequency: ${freshness}

# Contact
${email ? `contact-email: ${email}` : '# contact-email: (not specified)'}
`;

    setGeneratedFile(file);
  };

  // Scroll to validator section
  const scrollToValidator = () => {
    document.getElementById('validator')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Theme classes
  const themeClasses = isDark 
    ? "bg-[#0d1117] text-[#c9d1d9]" 
    : "bg-[#fafbfc] text-[#24292f]";
  
  const cardClasses = isDark
    ? "bg-[#161b22] border-[#30363d]"
    : "bg-white border-[#d0d7de]";

  const codeBlockClasses = isDark
    ? "bg-[#0d1117] border-[#30363d] text-[#c9d1d9]"
    : "bg-[#f6f8fa] border-[#d0d7de] text-[#24292f]";

  const accentColor = isDark ? "text-[#58a6ff]" : "text-[#0969da]";
  const mutedText = isDark ? "text-[#8b949e]" : "text-[#57606a]";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      <Helmet>
        <title>llms.txt – A Proposed Standard for AI-Readable Websites | FoundIndex</title>
        <meta name="description" content="A machine-readable file that declares how AI systems should interpret a website's content, inspired by how robots.txt guides crawlers." />
        <script type="application/ld+json">
          {JSON.stringify(techArticleSchema)}
        </script>
      </Helmet>

      {/* Header Navigation */}
      <Header />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-20 right-4 z-50 p-2 rounded-md border ${cardClasses} hover:opacity-80 transition-opacity`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-all duration-300"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Hero Section */}
      <header className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-block px-3 py-1 mb-6 text-xs font-mono rounded border ${cardClasses}`}>
            DRAFT SPECIFICATION v0.1
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 font-mono tracking-tight">
            llms.txt
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 font-light">
            A Proposed Standard for AI-Readable Websites
          </p>
          
          <p className={`text-lg mb-10 max-w-2xl mx-auto leading-relaxed ${mutedText}`}>
            A machine-readable file that declares how AI systems should interpret a website's content, inspired by how <code className={`px-1.5 py-0.5 rounded font-mono text-sm ${codeBlockClasses}`}>robots.txt</code> guides crawlers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={scrollToValidator}
              className={`px-6 py-3 h-auto font-mono text-sm ${isDark ? 'bg-[#238636] hover:bg-[#2ea043] text-white' : 'bg-[#1f883d] hover:bg-[#1a7f37] text-white'}`}
            >
              Check Your Site
            </Button>
            
            <a 
              href="#specification" 
              className={`font-mono text-sm hover:underline ${accentColor}`}
            >
              Read Full Specification (v0.1) →
            </a>
          </div>
        </div>
      </header>

      {/* Why This Exists Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 font-mono">
            Why llms.txt Exists
          </h2>

          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-semibold mb-3 font-mono">The Problem</h3>
              <p className={`leading-relaxed ${mutedText}`}>
                AI systems increasingly summarize, recommend, and cite websites. However, most websites are designed for human navigation, not machine interpretation. Key signals—such as purpose, authoritative content, and primary audiences—are often implicit, fragmented, or buried in layout and navigation layers. As a result, AI systems frequently misinterpret or ignore otherwise high-quality websites.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 font-mono">Limitations of Existing Approaches</h3>
              <p className={`leading-relaxed ${mutedText}`}>
                Current web standards address crawling and rendering, not interpretation. <code className={`px-1 py-0.5 rounded font-mono text-sm ${codeBlockClasses}`}>robots.txt</code> controls access, not meaning. Sitemaps enumerate URLs, not intent. Structured data (schema) describes entities, not site-level context. None provide a simple, site-level declaration of what the website is for and which content should be treated as authoritative.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 font-mono">What llms.txt Provides</h3>
              <p className={`leading-relaxed ${mutedText}`}>
                llms.txt introduces a small, explicit, opt-in file that allows site owners to declare high-level interpretive context for AI systems, including: the primary purpose of the site, intended audiences, authoritative entry points, and update cadence and scope. This information already exists on most websites—but only implicitly. llms.txt makes it explicit and machine-readable.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 font-mono">Intended Outcome</h3>
              <p className={`leading-relaxed ${mutedText}`}>
                llms.txt does not attempt to influence rankings or enforce behavior. It provides transparent, advisory metadata that AI systems may use as one signal among many when interpreting website content. The goal is to reduce ambiguity at ingestion time and improve consistency in how websites are understood by AI systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specification Section */}
      <section id="specification" className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className={`inline-block px-3 py-1 mb-6 text-xs font-mono rounded border ${cardClasses}`}>
            Version 0.1 – Draft Specification
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mono">
            Specification
          </h2>

          <p className={`mb-8 leading-relaxed ${mutedText}`}>
            This specification defines the syntax and semantics of llms.txt, a file format for declaring site-level interpretive context to AI systems. The format is designed to be simple, human-readable, and easily parseable by automated systems.
          </p>

          {/* Advisory Notice */}
          <div className={`p-4 rounded-md border mb-10 ${isDark ? 'bg-[#0d1117] border-[#bb8009]' : 'bg-[#fff8c5] border-[#bf8700]'}`}>
            <p className={`text-sm ${isDark ? 'text-[#d29922]' : 'text-[#9a6700]'}`}>
              <strong>Advisory:</strong> llms.txt is advisory metadata. AI systems may choose whether and how to use it, and should validate signals against actual page content.
            </p>
          </div>

          {/* Example File */}
          <h3 className="text-lg font-semibold mb-4 font-mono">Example File</h3>
          
          <div className={`relative rounded-md border overflow-hidden mb-10 ${cardClasses}`}>
            <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#d0d7de] bg-[#f6f8fa]'}`}>
              <span className="font-mono text-sm">llms.txt</span>
              <button
                onClick={() => copyToClipboard(`# llms.txt - AI Interpretive Metadata
# Specification: https://foundindex.com/llms-txt

version: 0.1
last-updated: 2024-12-15

# Site Context
site-purpose: B2B SaaS platform for API monitoring and observability
primary-audience: Developers, DevOps Engineers, CTOs
authoritative-pages: /docs, /pricing, /changelog, /blog

# Content Freshness
update-frequency: weekly

# Contact
contact-email: hello@example.com
language: en`, "Example file")}
                className={`p-1.5 rounded hover:bg-opacity-80 ${isDark ? 'hover:bg-[#30363d]' : 'hover:bg-[#d0d7de]'}`}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className={`p-4 text-sm font-mono overflow-x-auto ${codeBlockClasses} border-0`}>
              <code>{`# llms.txt - AI Interpretive Metadata
# Specification: https://foundindex.com/llms-txt

version: 0.1
last-updated: 2024-12-15

# Site Context
site-purpose: B2B SaaS platform for API monitoring and observability
primary-audience: Developers, DevOps Engineers, CTOs
authoritative-pages: /docs, /pricing, /changelog, /blog

# Content Freshness
update-frequency: weekly

# Contact
contact-email: hello@example.com
language: en`}</code>
            </pre>
          </div>

          {/* Directives Table */}
          <h3 className="text-lg font-semibold mb-4 font-mono">Supported Directives</h3>
          
          <div className={`rounded-md border overflow-hidden mb-10 ${cardClasses}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#d0d7de] bg-[#f6f8fa]'}`}>
                    <th className="px-4 py-3 text-left font-mono font-semibold">Directive</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Example</th>
                    <th className="px-4 py-3 text-left font-semibold">Required</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-[#30363d]' : 'divide-y divide-[#d0d7de]'}>
                  <tr>
                    <td className={`px-4 py-3 font-mono ${accentColor}`}>version</td>
                    <td className={`px-4 py-3 ${mutedText}`}>Specification version</td>
                    <td className="px-4 py-3 font-mono text-xs">0.1</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-[#238636]/20 text-[#3fb950]' : 'bg-[#dafbe1] text-[#1a7f37]'}`}>Required</span>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-mono ${accentColor}`}>site-purpose</td>
                    <td className={`px-4 py-3 ${mutedText}`}>Primary purpose or function of the website</td>
                    <td className="px-4 py-3 font-mono text-xs">B2B SaaS for...</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-[#238636]/20 text-[#3fb950]' : 'bg-[#dafbe1] text-[#1a7f37]'}`}>Required</span>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-mono ${accentColor}`}>primary-audience</td>
                    <td className={`px-4 py-3 ${mutedText}`}>Target audience(s) for the content</td>
                    <td className="px-4 py-3 font-mono text-xs">Developers, CTOs</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-[#30363d] text-[#8b949e]' : 'bg-[#eaeef2] text-[#57606a]'}`}>Optional</span>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-mono ${accentColor}`}>authoritative-pages</td>
                    <td className={`px-4 py-3 ${mutedText}`}>Key pages representing site's core content</td>
                    <td className="px-4 py-3 font-mono text-xs">/docs, /pricing</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-[#30363d] text-[#8b949e]' : 'bg-[#eaeef2] text-[#57606a]'}`}>Optional</span>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-mono ${accentColor}`}>update-frequency</td>
                    <td className={`px-4 py-3 ${mutedText}`}>How often content is updated</td>
                    <td className="px-4 py-3 font-mono text-xs">daily | weekly | monthly</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-[#30363d] text-[#8b949e]' : 'bg-[#eaeef2] text-[#57606a]'}`}>Optional</span>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-mono ${accentColor}`}>last-updated</td>
                    <td className={`px-4 py-3 ${mutedText}`}>Date of last content update (ISO 8601)</td>
                    <td className="px-4 py-3 font-mono text-xs">2024-12-15</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-[#30363d] text-[#8b949e]' : 'bg-[#eaeef2] text-[#57606a]'}`}>Optional</span>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-mono ${accentColor}`}>contact-email</td>
                    <td className={`px-4 py-3 ${mutedText}`}>Contact for AI system operators</td>
                    <td className="px-4 py-3 font-mono text-xs">ai@example.com</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-[#30363d] text-[#8b949e]' : 'bg-[#eaeef2] text-[#57606a]'}`}>Optional</span>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 font-mono ${accentColor}`}>language</td>
                    <td className={`px-4 py-3 ${mutedText}`}>Primary language (ISO 639-1)</td>
                    <td className="px-4 py-3 font-mono text-xs">en</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDark ? 'bg-[#30363d] text-[#8b949e]' : 'bg-[#eaeef2] text-[#57606a]'}`}>Optional</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Implementation Details */}
          <h3 className="text-lg font-semibold mb-4 font-mono">Implementation Details</h3>
          
          <div className={`space-y-4 p-6 rounded-md border ${cardClasses}`}>
            <div>
              <h4 className="font-semibold mb-2">File Location</h4>
              <p className={`text-sm ${mutedText}`}>
                <code className={`px-1 py-0.5 rounded font-mono ${codeBlockClasses}`}>https://yoursite.com/llms.txt</code> or <code className={`px-1 py-0.5 rounded font-mono ${codeBlockClasses}`}>https://yoursite.com/.well-known/llms.txt</code> (recommended)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">File Format</h4>
              <p className={`text-sm ${mutedText}`}>
                UTF-8 encoding, LF line endings, <code className={`px-1 py-0.5 rounded font-mono ${codeBlockClasses}`}>key: value</code> syntax. Comments begin with <code className={`px-1 py-0.5 rounded font-mono ${codeBlockClasses}`}>#</code>.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Parser Behavior</h4>
              <p className={`text-sm ${mutedText}`}>
                Unknown directives must be safely ignored (fail gracefully). Declarations in llms.txt are expected to be evaluated against observed site content and behavior.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Update Guidelines</h4>
              <p className={`text-sm ${mutedText}`}>
                Update the <code className={`px-1 py-0.5 rounded font-mono ${codeBlockClasses}`}>last-updated</code> directive when content changes materially.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Scope</h4>
              <p className={`text-sm ${mutedText}`}>
                llms.txt is intentionally coarse-grained and does not express keywords, weights, or ranking signals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Validator Section */}
      <section id="validator" className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mono">
            Validate Your llms.txt
          </h2>

          <div className={`p-6 rounded-md border ${cardClasses}`}>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                type="text"
                placeholder="Enter your website URL (e.g., example.com)"
                value={validatorUrl}
                onChange={(e) => setValidatorUrl(e.target.value)}
                className={`flex-1 font-mono text-sm ${isDark ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder:text-[#484f58]' : 'bg-white border-[#d0d7de]'}`}
              />
              <Button
                onClick={handleValidate}
                disabled={isValidating}
                className={`font-mono text-sm ${isDark ? 'bg-[#238636] hover:bg-[#2ea043] text-white' : 'bg-[#1f883d] hover:bg-[#1a7f37] text-white'}`}
              >
                {isValidating ? "Validating..." : "Validate llms.txt"}
              </Button>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div className={`p-4 rounded-md border ${isDark ? 'border-[#30363d] bg-[#0d1117]' : 'border-[#d0d7de] bg-[#f6f8fa]'}`}>
                {/* File Detection */}
                <div className="flex items-center gap-2 mb-4">
                  {validationResult.found ? (
                    <>
                      <Check className="w-5 h-5 text-[#3fb950]" />
                      <span className="font-semibold">File detected</span>
                      <span className={`text-sm ${mutedText}`}>at {validationResult.location}</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-[#f85149]" />
                      <span className="font-semibold">No llms.txt found</span>
                    </>
                  )}
                </div>

                {validationResult.found && validationResult.directives && (
                  <>
                    {/* Syntax Validity */}
                    <div className="flex items-center gap-2 mb-4">
                      {validationResult.valid ? (
                        <>
                          <Check className="w-5 h-5 text-[#3fb950]" />
                          <span className="font-semibold">Syntax valid</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-[#f85149]" />
                          <span className="font-semibold">Syntax errors found</span>
                        </>
                      )}
                    </div>

                    {/* Completeness Score */}
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5" />
                      <span className="font-semibold">Completeness score: {validationResult.completenessScore}/10</span>
                    </div>

                    {/* Warnings */}
                    {validationResult.warnings && validationResult.warnings.length > 0 && (
                      <div className={`p-3 rounded border mb-4 ${isDark ? 'bg-[#0d1117] border-[#bb8009]' : 'bg-[#fff8c5] border-[#bf8700]'}`}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${isDark ? 'text-[#d29922]' : 'text-[#9a6700]'}`} />
                          <div className={`text-sm ${isDark ? 'text-[#d29922]' : 'text-[#9a6700]'}`}>
                            {validationResult.warnings.map((w, i) => (
                              <div key={i}>{w}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Parsed Directives */}
                    <div className={`p-3 rounded border font-mono text-sm ${codeBlockClasses}`}>
                      <div className="mb-2 font-semibold">Parsed directives:</div>
                      {Object.entries(validationResult.directives).map(([key, value]) => (
                        <div key={key}>
                          <span className={accentColor}>{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* No file found - show boilerplate */}
                {!validationResult.found && (
                  <div className="mt-4">
                    <p className={`mb-3 text-sm ${mutedText}`}>
                      Get started with this minimal boilerplate:
                    </p>
                    <div className={`relative rounded-md border overflow-hidden ${cardClasses}`}>
                      <div className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? 'border-[#30363d]' : 'border-[#d0d7de]'}`}>
                        <span className="font-mono text-xs">llms.txt</span>
                        <button
                          onClick={() => copyToClipboard(`version: 0.1
site-purpose: [Your site's purpose]
primary-audience: [Your target audience]
authoritative-pages: /docs, /pricing
update-frequency: weekly`, "Boilerplate")}
                          className={`p-1 rounded hover:bg-opacity-80 ${isDark ? 'hover:bg-[#30363d]' : 'hover:bg-[#d0d7de]'}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <pre className={`p-3 text-xs font-mono ${codeBlockClasses} border-0`}>
{`version: 0.1
site-purpose: [Your site's purpose]
primary-audience: [Your target audience]
authoritative-pages: /docs, /pricing
update-frequency: weekly`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Link to generator */}
            <button
              onClick={() => setShowGenerator(!showGenerator)}
              className={`mt-4 flex items-center gap-1 text-sm font-mono ${accentColor} hover:underline`}
            >
              Need help? Generate your llms.txt
              <ChevronDown className={`w-4 h-4 transition-transform ${showGenerator ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      {showGenerator && (
        <section className="pb-12 md:pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className={`p-6 rounded-md border ${cardClasses}`}>
              <h3 className="text-xl font-bold mb-6 font-mono">Generate Your llms.txt</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Site Purpose *</label>
                  <Input
                    type="text"
                    placeholder="e.g., B2B SaaS for API monitoring"
                    value={generatorForm.purpose}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, purpose: e.target.value })}
                    className={`font-mono text-sm ${isDark ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder:text-[#484f58]' : 'bg-white border-[#d0d7de]'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Primary Audience</label>
                  <Input
                    type="text"
                    placeholder="e.g., Developers, CTOs"
                    value={generatorForm.audience}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, audience: e.target.value })}
                    className={`font-mono text-sm ${isDark ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder:text-[#484f58]' : 'bg-white border-[#d0d7de]'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Authoritative Pages</label>
                  <Textarea
                    placeholder="Enter URLs, one per line:&#10;/docs&#10;/pricing&#10;/blog"
                    value={generatorForm.pages}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, pages: e.target.value })}
                    rows={3}
                    className={`font-mono text-sm ${isDark ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder:text-[#484f58]' : 'bg-white border-[#d0d7de]'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content Freshness</label>
                  <Select
                    value={generatorForm.freshness}
                    onValueChange={(value) => setGeneratorForm({ ...generatorForm, freshness: value })}
                  >
                    <SelectTrigger className={`font-mono text-sm ${isDark ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]' : 'bg-white border-[#d0d7de]'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-[#161b22] border-[#30363d]' : ''}>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <Input
                    type="email"
                    placeholder="hello@example.com"
                    value={generatorForm.email}
                    onChange={(e) => setGeneratorForm({ ...generatorForm, email: e.target.value })}
                    className={`font-mono text-sm ${isDark ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] placeholder:text-[#484f58]' : 'bg-white border-[#d0d7de]'}`}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  className={`w-full font-mono text-sm ${isDark ? 'bg-[#238636] hover:bg-[#2ea043] text-white' : 'bg-[#1f883d] hover:bg-[#1a7f37] text-white'}`}
                >
                  Generate llms.txt
                </Button>

                {/* Generated Output */}
                {generatedFile && (
                  <div className={`relative rounded-md border overflow-hidden ${cardClasses}`}>
                    <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#d0d7de] bg-[#f6f8fa]'}`}>
                      <span className="font-mono text-sm">Generated llms.txt</span>
                      <button
                        onClick={() => copyToClipboard(generatedFile, "Generated file")}
                        className={`p-1.5 rounded hover:bg-opacity-80 ${isDark ? 'hover:bg-[#30363d]' : 'hover:bg-[#d0d7de]'}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <pre className={`p-4 text-sm font-mono overflow-x-auto ${codeBlockClasses} border-0`}>
                      <code>{generatedFile}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Adoption Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mono">
            Adoption
          </h2>

          {/* Badges */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border ${cardClasses}`}>
              <span className="font-mono text-sm font-semibold">llms.txt implementations:</span>
              <span className={`font-mono text-lg font-bold ${accentColor}`}>{IMPLEMENTATIONS_COUNT}+</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm ${cardClasses}`}>
              <span className={`font-mono ${mutedText}`}>Validations performed:</span>
              <span className="font-mono font-semibold">{VALIDATIONS_COUNT}</span>
            </div>
          </div>

          <p className={`mb-8 text-sm ${mutedText}`}>
            Implementations reflect validated sites crawled by FoundIndex. Validation count reflects testing activity. Counts updated every 24 hours.
          </p>

          {/* Display Badge */}
          <h3 className="text-lg font-semibold mb-4 font-mono">Display Your Badge</h3>
          
          <p className={`mb-4 text-sm ${mutedText}`}>
            Show visitors that your site is AI-readable:
          </p>

          {/* Live Badge Preview */}
          <div className={`mb-6 p-8 rounded-lg border-4 ${isDark ? 'bg-[#0d1117] border-green-500' : 'bg-green-50 border-green-500'}`}>
            <p className={`text-lg font-bold mb-4 text-center ${isDark ? 'text-green-400' : 'text-green-700'}`}>
              Live Preview:
            </p>
            <div className="flex items-center justify-center py-6 bg-white rounded-lg">
              <a href="https://foundindex.com/llms-txt" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
                <img src="/badges/ai-readable.svg" alt="AI-Readable Site" style={{ height: '40px', width: 'auto' }} />
              </a>
            </div>
            <p className={`text-sm text-center mt-4 ${mutedText}`}>
              This site follows the llms.txt standard
            </p>
          </div>

          <div className={`relative rounded-md border overflow-hidden ${cardClasses}`}>
            <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-[#30363d] bg-[#161b22]' : 'border-[#d0d7de] bg-[#f6f8fa]'}`}>
              <span className="font-mono text-sm">HTML</span>
              <button
                onClick={() => copyToClipboard(`<a href="https://foundindex.com/llms-txt">
  <img src="https://foundindex.com/badges/ai-readable.svg" alt="AI-Readable Site">
</a>`, "Badge code")}
                className={`p-1.5 rounded hover:bg-opacity-80 ${isDark ? 'hover:bg-[#30363d]' : 'hover:bg-[#d0d7de]'}`}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <pre className={`p-4 text-sm font-mono overflow-x-auto ${codeBlockClasses} border-0`}>
{`<a href="https://foundindex.com/llms-txt">
  <img src="https://foundindex.com/badges/ai-readable.svg" alt="AI-Readable Site">
</a>`}
            </pre>
          </div>
        </div>
      </section>

      {/* Implementation Stories (Empty State) */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mono">
            Early Implementations
          </h2>
          
          <div className={`p-8 rounded-md border text-center ${cardClasses}`}>
            <p className={mutedText}>
              First implementations launching soon. Join the early adopters.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 font-mono">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="seo" className={`border rounded-md px-4 ${cardClasses}`}>
              <AccordionTrigger className="font-mono text-sm hover:no-underline">
                Is this SEO manipulation?
              </AccordionTrigger>
              <AccordionContent className={`text-sm pb-4 ${mutedText}`}>
                No. llms.txt provides transparent, site-level interpretive metadata, not ranking signals. It does not express keywords, weights, or content optimization. AI systems validate declarations against actual page content. This is structural clarity, not manipulation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="adoption" className={`border rounded-md px-4 ${cardClasses}`}>
              <AccordionTrigger className="font-mono text-sm hover:no-underline">
                Will AI systems actually use this?
              </AccordionTrigger>
              <AccordionContent className={`text-sm pb-4 ${mutedText}`}>
                llms.txt is a community-proposed standard. AI systems that parse it gain cleaner training data, higher answer accuracy, and reduced hallucinations from ambiguous content. Adoption depends on ecosystem buy-in. Early experiments suggest improved AI discoverability for implementing sites.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="robots" className={`border rounded-md px-4 ${cardClasses}`}>
              <AccordionTrigger className="font-mono text-sm hover:no-underline">
                How is this different from robots.txt?
              </AccordionTrigger>
              <AccordionContent className={`text-sm pb-4 ${mutedText}`}>
                robots.txt controls access (what can be crawled). llms.txt provides semantic interpretation (what content means). They serve different purposes. robots.txt = access control. llms.txt = interpretive context.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="schema" className={`border rounded-md px-4 ${cardClasses}`}>
              <AccordionTrigger className="font-mono text-sm hover:no-underline">
                How is this different from schema.org?
              </AccordionTrigger>
              <AccordionContent className={`text-sm pb-4 ${mutedText}`}>
                Schema describes entities (people, products, events). llms.txt declares site-level context (purpose, audience, authoritative pages). Schema answers "what exists." llms.txt answers "what matters." They complement each other.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="maintainer" className={`border rounded-md px-4 ${cardClasses}`}>
              <AccordionTrigger className="font-mono text-sm hover:no-underline">
                Who maintains llms.txt?
              </AccordionTrigger>
              <AccordionContent className={`text-sm pb-4 ${mutedText}`}>
                Initiated by FoundIndex, with governance transitioning to an open community process as adoption grows. The specification is versioned, open for contributions via GitHub, and follows semantic versioning. Breaking changes require major version increments.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="spam" className={`border rounded-md px-4 ${cardClasses}`}>
              <AccordionTrigger className="font-mono text-sm hover:no-underline">
                Won't this just be gamed by spammers?
              </AccordionTrigger>
              <AccordionContent className={`text-sm pb-4 ${mutedText}`}>
                llms.txt is advisory, not authoritative. AI systems should validate declarations against observed site content and behavior. Mismatches between declared and actual content reduce trust. This is similar to how search engines handle meta tags—signals are evaluated, not blindly trusted.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="endorsement" className={`border rounded-md px-4 ${cardClasses}`}>
              <AccordionTrigger className="font-mono text-sm hover:no-underline">
                Is this endorsed by OpenAI/Google?
              </AccordionTrigger>
              <AccordionContent className={`text-sm pb-4 ${mutedText}`}>
                No. This is a community-proposed standard, open for adoption by any AI system or platform. Endorsement is not required for use. The goal is to provide a consistent, simple mechanism that any system can choose to implement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="roadmap" className={`border rounded-md px-4 ${cardClasses}`}>
              <AccordionTrigger className="font-mono text-sm hover:no-underline">
                What's the roadmap?
              </AccordionTrigger>
              <AccordionContent className={`text-sm pb-4 ${mutedText}`}>
                Version 0.1 focuses on core directives. Future versions may add: content categorization, multi-language support, and time-based scopes. W3C Community Group submission planned for mid-2026. Versioning follows semantic versioning principles with backward compatibility prioritized.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Versioning Section */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-3 font-mono">Versioning Commitment</h3>
          <p className={`text-sm ${mutedText}`}>
            This specification follows semantic versioning (v0.1, v0.2, v1.0). Breaking changes require major version increments. Backward compatibility is prioritized. All versions documented on GitHub.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 border-t ${isDark ? 'border-[#30363d]' : 'border-[#d0d7de]'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className={`text-sm ${mutedText}`}>
              Initiated by{" "}
              <Link to="/" className={`font-semibold hover:underline ${accentColor}`}>
                FoundIndex
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 items-center">
              <a 
                href="https://github.com/richa-foundindex-ai/llms-txt" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-sm font-semibold flex items-center gap-2 hover:underline ${accentColor}`}
              >
                <Github className="w-5 h-5" />
                View Specification on GitHub
              </a>
              <span className={mutedText}>•</span>
              <a 
                href="mailto:hello@foundindex.com"
                className={`text-sm hover:underline ${accentColor}`}
              >
                Contact: hello@foundindex.com
              </a>
              <span className={mutedText}>•</span>
              <Link to="/" className={`text-sm hover:underline ${accentColor}`}>
                FoundIndex Homepage
              </Link>
            </div>
          </div>
          
          {/* AI-Readable Badge in Footer */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <Link to="/llms-txt" className="inline-block hover:opacity-80 transition-opacity">
              <img src="/badges/ai-readable.svg" alt="AI-Readable Site" style={{ height: '24px' }} />
            </Link>
            <p className={`text-xs ${mutedText}`}>This site follows the llms.txt standard</p>
          </div>
          
          <div className={`mt-4 text-center text-xs ${mutedText}`}>
            Powered by FoundIndex
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LlmsTxt;
