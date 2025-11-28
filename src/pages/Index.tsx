import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [homepageUrl, setHomepageUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [isLoadingHomepage, setIsLoadingHomepage] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);

  const validateUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    return trimmed.startsWith("http://") || trimmed.startsWith("https://");
  };

  const handleHomepageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(homepageUrl)) {
      alert("Please enter a valid URL with http:// or https://");
      return;
    }
    setIsLoadingHomepage(true);
    // Simulate navigation to results
    setTimeout(() => {
      navigate("/results");
    }, 1000);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(blogUrl)) {
      alert("Please enter a valid URL with http:// or https://");
      return;
    }
    setIsLoadingBlog(true);
    // Simulate navigation to results
    setTimeout(() => {
      navigate("/results");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <Badge className="mb-6 text-base px-6 py-2 bg-primary text-primary-foreground hover:bg-primary-hover">
          🚀 FREE BETA
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
          Will AI Search Engines Find Your Content?
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto">
          Get your FI Score™ in 60 seconds. See exactly what's blocking AI tools from finding your content.
        </p>
        
        <p className="text-sm text-muted-foreground">
          Join 500+ early testers | Built on Microsoft's AI optimization framework
        </p>
      </section>

      {/* Two Testing Boxes */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Homepage Audit */}
          <Card className="relative bg-gradient-to-br from-blue-light to-background border-2 border-blue/20 hover:border-blue/40 transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Homepage Audit</h2>
              <p className="text-muted-foreground mb-6">
                Test business clarity and positioning
              </p>
              
              <form onSubmit={handleHomepageSubmit} className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://yoursite.com"
                  value={homepageUrl}
                  onChange={(e) => setHomepageUrl(e.target.value)}
                  className="h-12 text-base"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-blue hover:bg-blue/90 text-white"
                  disabled={isLoadingHomepage}
                >
                  {isLoadingHomepage ? "Loading..." : "Get FI Score"}
                </Button>
              </form>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Normally $97 | <span className="font-bold text-foreground">FREE during beta</span>
              </p>
            </CardContent>
          </Card>

          {/* Blog Post Audit */}
          <Card className="relative bg-gradient-to-br from-purple-light to-background border-2 border-purple/20 hover:border-purple/40 transition-all duration-300">
            <Badge className="absolute top-4 right-4 bg-warning text-warning-foreground">
              MOST POPULAR
            </Badge>
            
            <CardContent className="p-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Blog Post Audit</h2>
              <p className="text-muted-foreground mb-6">
                Test AI readability and structure
              </p>
              
              <form onSubmit={handleBlogSubmit} className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://yoursite.com/blog/post"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                  className="h-12 text-base"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-purple hover:bg-purple/90 text-white"
                  disabled={isLoadingBlog}
                >
                  {isLoadingBlog ? "Loading..." : "Get FI Score"}
                </Button>
              </form>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Normally $27 | <span className="font-bold text-foreground">FREE during beta</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Enter Your URL</h3>
              <p className="text-muted-foreground">Test any page instantly</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Get Your FI Score™</h3>
              <p className="text-muted-foreground">See your 0-100 score</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Review Recommendations</h3>
              <p className="text-muted-foreground">Get specific fixes</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">4️⃣</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Track Improvements</h3>
              <p className="text-muted-foreground">Retest anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Benefits */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          🎉 Beta Tester Benefits
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">All Features Free</h3>
              <p className="text-muted-foreground">
                Access every diagnostic tool at no cost
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">♾️</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Unlimited Tests</h3>
              <p className="text-muted-foreground">
                Test as many pages as you want
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Priority Support</h3>
              <p className="text-muted-foreground">
                Get help when you need it most
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              Created by <span className="font-medium">Richa Deo</span> |{" "}
              <a href="https://richadeo.com" target="_blank" rel="noopener noreferrer" className="text-link hover:text-link-hover">
                RichaDeo.com →
              </a>
            </div>
            
            <div className="flex gap-6">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            
            <div>
              © 2025 FoundIndex
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
