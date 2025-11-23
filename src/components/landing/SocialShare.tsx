import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Linkedin, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const SocialShare = () => {
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const shareUrl = "https://foundindex.com";
  const shareText = "🎯 Found this tool: FoundIndex\n\nMeasures if ChatGPT recommends your business when buyers search.\n\nFirst standardized AI visibility benchmark.\n\nFree test:";
  const linkedInShareText = "Just tested my website's AI visibility with FoundIndex. Worth checking if AI systems understand your business.\n\nfoundindex.com\n\n#AIVisibility #ContentStrategy";
  
  const handleLinkedInShare = async () => {
    try {
      // Copy text to clipboard
      await navigator.clipboard.writeText(linkedInShareText);
      
      // Open LinkedIn share window
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(linkedInUrl, '_blank', 'width=600,height=600');
      
      // Show modal with instructions
      setShowLinkedInModal(true);
    } catch (err) {
      toast.error('Failed to copy text to clipboard');
    }
  };

  const handleTwitterShare = () => {
    const twitterText = `${shareText} ${shareUrl}\n\n#AISearch #SEO`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=600');
  };

  const handleWhatsAppShare = () => {
    const whatsappText = `${shareText} ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = "Check out FoundIndex - AI Visibility Benchmark";
    const body = `${shareText}\n\n${shareUrl}\n\nThis tool measures how often ChatGPT recommends your business to potential buyers.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('✅ Link copied to clipboard!', {
        description: 'Share it with your network',
        duration: 3000,
      });
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      <section className="py-20 px-4 bg-accent/50">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <h2 className="text-editorial-lg mb-4">
              Help Others Discover FoundIndex
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Know someone who should test their AI visibility? Share FoundIndex with your network.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={handleLinkedInShare}
                className="bg-[#0077B5] hover:bg-[#006399] text-white"
              >
                <Linkedin className="mr-2 h-4 w-4" />
                Share on LinkedIn
              </Button>

              <Button 
                onClick={handleTwitterShare}
                className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
              >
                <Twitter className="mr-2 h-4 w-4" />
                Share on Twitter
              </Button>

              <Button 
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Share on WhatsApp
              </Button>

              <Button 
                onClick={handleEmailShare}
                variant="outline"
              >
                <Mail className="mr-2 h-4 w-4" />
                Share via Email
              </Button>

              <Button 
                onClick={handleCopyLink}
                variant="outline"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Dialog open={showLinkedInModal} onOpenChange={setShowLinkedInModal}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <div className="p-8">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-3xl font-bold text-center">
                📋 Text copied to clipboard
              </DialogTitle>
              <DialogDescription className="text-lg text-center">
                Paste this into your LinkedIn post:
              </DialogDescription>
            </DialogHeader>
            
            <div className="my-8">
              <div className="bg-white border-2 border-border rounded-lg p-6 shadow-sm">
                <p className="text-[16px] leading-relaxed whitespace-pre-line text-gray-900 font-normal">
                  {linkedInShareText}
                </p>
              </div>
            </div>

            <Button 
              onClick={() => setShowLinkedInModal(false)} 
              className="w-full text-lg py-6"
              size="lg"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialShare;
