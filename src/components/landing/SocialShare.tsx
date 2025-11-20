import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Linkedin, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const SocialShare = () => {
  const shareUrl = "https://foundindex.com";
  const shareText = "🎯 Found this tool: FoundIndex\n\nMeasures if ChatGPT recommends your business when buyers search.\n\nFirst standardized AI visibility benchmark.\n\nFree test:";
  
  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
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
  );
};

export default SocialShare;
