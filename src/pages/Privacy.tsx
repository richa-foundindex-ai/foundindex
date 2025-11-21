import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <Card className="max-w-2xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Privacy & Terms</h1>
        
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>FoundIndex is in beta. We:</p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>Don't store your website data</li>
            <li>Don't sell your information</li>
            <li>Use OpenAI for analysis only</li>
            <li>Store email addresses only if you opt in for v2 updates</li>
          </ul>
          
          <p className="pt-4">
            Questions? Email: <a href="mailto:hello@foundindex.com" className="text-primary hover:underline">hello@foundindex.com</a>
          </p>
          
          <p className="pt-2">Full privacy policy coming with v2 launch.</p>
        </div>
        
        <div className="pt-6">
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Privacy;
