import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Share2,
  Download,
  Home,
  FileText,
  Lock,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { analytics } from "@/utils/analytics";
import { supabase } from "@/integrations/supabase/client";

// =============================================================================
// TYPES & HELPERS
// =============================================================================

const ensureArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") return [value];
  return [];
};

type CategorySummary = {
  name: string;
  key: string;
  score: number;
  max: number;
  percentage: number;
  details?: unknown;
  breakdown?: { summary?: string; scores?: Array<{ category: string; found: boolean }> };
};

type Recommendation = {
  id: string;
  priority: string;
  title: string;
  pointsLost: number;
  problem: string;
  howToFix: string[] | string;
  codeExample: string;
  expectedImprovement: string;
};

type ResultData = {
  score: number;
  grade: string;
  gradeLabel: string;
  testType: "homepage" | "blog";
  categories: CategorySummary[];
  recommendations: Recommendation[];
  criteriaCount: number;
  industryAverage: number;
};

const getGradeInfo = (score: number) => {
  if (score >= 90) return { grade: "A", label: "Elite", color: "text-green-600" };
  if (score >= 80) return { grade: "B", label: "Strong", color: "text-green-500" };
  if (score >= 70) return { grade: "C", label: "Average", color: "text-yellow-500" };
  if (score >= 60) return { grade: "D", label: "Weak", color: "text-orange-500" };
  return { grade: "F", label: "Critical", color: "text-red-600" };
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

const getCategoryDisplayName = (key: string): string => {
  const names: Record<string, string> = {
    schemaMarkup: "Schema markup",
    semanticStructure: "Semantic structure",
    technicalFoundation: "Technical foundation",
    images: "Image optimization",
    contentClarity: "Content clarity",
    answerStructure: "Answer structure",
    authoritySignals: "Authority signals",
    scannability: "Scannability",
    expertiseSignals: "Expertise signals",
  };
  return names[key] || key;
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "critical":
      return <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />;
    case "medium":
      return <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />;
    case "good":
      return <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />;
    default:
      return <AlertCircle className="h-5 w-5 flex-shrink-0" />;
  }
};

const getPriorityBadge = (priority: string) => {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    good: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  const labels: Record<string, string> = { critical: "Critical", medium: "Medium", good: "Good" };
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${styles[priority] || ""}`}>
      {labels[priority] || priority}
    </span>
  );
};

// =============================================================================
// SPEEDOMETER GAUGE
// =============================================================================

const SpeedometerGauge = ({ score }: { score: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width,
      height = canvas.height;
    const centerX = width / 2,
      centerY = height - 40;
    const radius = Math.min(width, height) - 60;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = 30;
    ctx.strokeStyle = "#e5e7eb";
    ctx.stroke();

    // Colored segments
    const segments = [
      { start: 0, end: 0.4, color: "#ef4444" },
      { start: 0.4, end: 0.6, color: "#f59e0b" },
      { start: 0.6, end: 0.7, color: "#eab308" },
      { start: 0.7, end: 0.8, color: "#84cc16" },
      { start: 0.8, end: 1, color: "#10b981" },
    ];

    for (const seg of segments) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI + seg.start * Math.PI, Math.PI + seg.end * Math.PI, false);
      ctx.lineWidth = 30;
      ctx.strokeStyle = seg.color;
      ctx.stroke();
    }

    // Ticks
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI + (i / 10) * Math.PI;
      const x1 = centerX + Math.cos(angle) * (radius - 20);
      const y1 = centerY + Math.sin(angle) * (radius - 20);
      const x2 = centerX + Math.cos(angle) * (radius + 20);
      const y2 = centerY + Math.sin(angle) * (radius + 20);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = i % 5 === 0 ? 3 : 1;
      ctx.strokeStyle = "#6b7280";
      ctx.stroke();

      if (i % 2 === 0) {
        const tx = centerX + Math.cos(angle) * (radius + 40);
        const ty = centerY + Math.sin(angle) * (radius + 40);
        ctx.font = "14px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#6b7280";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((i * 10).toString(), tx, ty);
      }
    }

    // Needle
    const needleAngle = Math.PI + (score / 100) * Math.PI;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(needleAngle - Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(0, -(radius - 40));
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fillStyle = "#1f2937";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }, [score]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={400} height={250} className="mx-auto max-w-full" />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-5xl font-bold" style={{ color: getScoreColor(score) }}>
          {score}
        </div>
        <div className="text-sm text-muted-foreground">out of 100</div>
      </div>
    </div>
  );
};

// =============================================================================
// CODE BLOCK
// =============================================================================

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative mt-2">
      <Button size="sm" variant="ghost" className="absolute top-2 right-2 z-10" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// =============================================================================
// FREE RECOMMENDATION (shows problem only, solution blurred)
// =============================================================================

const FreeRecommendation = ({ rec, onUnlock }: { rec: Recommendation; onUnlock: () => void }) => {
  return (
    <div className="border rounded-lg p-4 mb-3">
      <div className="flex items-start gap-3">
        {getPriorityIcon(rec.priority)}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {getPriorityBadge(rec.priority)}
            <span className="font-semibold">{rec.title}</span>
            {rec.pointsLost < 0 && <span className="text-red-600 text-sm">({rec.pointsLost} pts)</span>}
          </div>

          {/* Problem - FREE */}
          {rec.problem && (
            <div className="mb-3">
              <p className="text-sm font-medium text-muted-foreground">Problem:</p>
              <p className="text-sm">{rec.problem}</p>
            </div>
          )}

          {/* Solution - BLURRED */}
          <div className="relative">
            <div className="filter blur-sm pointer-events-none select-none bg-muted/50 p-3 rounded">
              <p className="text-sm font-medium">How to fix:</p>
              <p className="text-sm text-muted-foreground">Step-by-step instructions to fix this issue...</p>
              <p className="text-sm font-medium mt-2">Code example:</p>
              <p className="text-sm text-muted-foreground font-mono">{'<script type="application/ld+json">...'}</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={onUnlock} size="sm" variant="secondary" className="gap-2">
                <Lock className="h-4 w-4" />
                Unlock solution
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// LOCKED RECOMMENDATION (fully blurred)
// =============================================================================

const LockedRecommendation = ({ rec, onUnlock }: { rec: Recommendation; onUnlock: () => void }) => (
  <div className="relative border rounded-lg p-4 mb-3">
    <div className="filter blur-sm pointer-events-none select-none">
      <div className="flex items-start gap-3">
        {getPriorityIcon(rec.priority)}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getPriorityBadge(rec.priority)}
            <span className="font-semibold">{rec.title}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Problem description and solution steps...</p>
        </div>
      </div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg">
      <Button onClick={onUnlock} variant="outline" className="gap-2">
        <Lock className="h-4 w-4" />
        Unlock with email
      </Button>
    </div>
  </div>
);

// =============================================================================
// UNLOCKED RECOMMENDATION (full details)
// =============================================================================

const UnlockedRecommendation = ({ rec }: { rec: Recommendation }) => (
  <AccordionItem value={rec.id}>
    <AccordionTrigger>
      <div className="flex items-start gap-3 text-left w-full">
        {getPriorityIcon(rec.priority)}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getPriorityBadge(rec.priority)}
            <span className="font-semibold">{rec.title}</span>
            {rec.pointsLost < 0 && <span className="text-red-600 text-sm">({rec.pointsLost} pts)</span>}
          </div>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="pl-8 space-y-4 pt-2">
        {rec.problem && (
          <div>
            <h4 className="font-semibold mb-1">Problem:</h4>
            <p className="text-sm text-muted-foreground">{rec.problem}</p>
          </div>
        )}
        {ensureArray(rec.howToFix).length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">How to fix:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {ensureArray(rec.howToFix).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>
        )}
        {rec.codeExample && (
          <div>
            <h4 className="font-semibold mb-1">Code example:</h4>
            <CodeBlock code={rec.codeExample} />
          </div>
        )}
        {rec.expectedImprovement && (
          <p className="text-sm font-semibold text-green-600">Expected: {rec.expectedImprovement}</p>
        )}
      </div>
    </AccordionContent>
  </AccordionItem>
);

// =============================================================================
// EMAIL UNLOCK DIALOG
// =============================================================================

const EmailUnlockDialog = ({
  open,
  onOpenChange,
  onUnlock,
  website,
  testId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
  website: string;
  testId: string | null;
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to contacts table
      const { error: insertError } = await supabase.from("contacts").insert({
        name: "Results unlock",
        email: email.trim().toLowerCase(),
        subject: "Unlocked full results",
        message: `Unlocked results for ${website} (test: ${testId})`,
      });

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw insertError;
      }

      // Store in localStorage
      localStorage.setItem("fi_unlocked_email", email.trim().toLowerCase());

      onUnlock();
      onOpenChange(false);
    } catch (err) {
      console.error("Email submit error:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🔓 Unlock all recommendations</DialogTitle>
          <DialogDescription>Get step-by-step fixes and code examples for all issues.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlock-email">Email address</Label>
            <Input
              id="unlock-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ fontSize: "16px" }}
              className="h-12"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">You'll get:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>✓ All recommendations unlocked</li>
              <li>✓ Copy-paste code examples</li>
              <li>✓ Priority-sorted action list</li>
              <li>✓ Downloadable report</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">No spam. We only email about your results.</p>

          <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              "Unlock all recommendations"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// TESTIMONIAL FEEDBACK DIALOG (with name, permission, backlink)
// =============================================================================

const TestimonialFeedbackDialog = ({
  open,
  onOpenChange,
  website,
  testId,
  score,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  website: string;
  testId: string | null;
  score: number;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: localStorage.getItem("fi_unlocked_email") || "",
    userType: "",
    surprisingResult: "",
    mostUseful: "",
    wouldRecommend: "",
    improvements: "",
    canUseName: false,
    canUseAsTestimonial: false,
    websiteForBacklink: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("feedback").insert({
        test_id: testId || "unknown",
        website: website,
        email: formData.email || "anonymous@foundindex.local",
        score: score,
        user_type: formData.userType,
        describe_to_colleague: `Name: ${formData.name} | Most useful: ${formData.mostUseful} | Would recommend: ${formData.wouldRecommend} | Can use name: ${formData.canUseName} | Can use as testimonial: ${formData.canUseAsTestimonial} | Backlink site: ${formData.websiteForBacklink}`,
        surprising_result: formData.surprisingResult,
        preventing_improvements: formData.improvements,
      });

      if (error) {
        console.error("Feedback insert error:", error);
        throw error;
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Feedback error:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <DialogTitle>Thank you!</DialogTitle>
          <DialogDescription>
            Your feedback helps us improve FoundIndex.
            {formData.canUseAsTestimonial && formData.websiteForBacklink && (
              <span className="block mt-2 text-green-600">
                We'll add your testimonial with a backlink to your site!
              </span>
            )}
          </DialogDescription>
          <Button onClick={() => onOpenChange(false)} className="mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>💬 Share your feedback</DialogTitle>
          <DialogDescription>Help us improve — get featured with a backlink to your site!</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fb-name">Your name</Label>
              <Input
                id="fb-name"
                placeholder="Jane Smith"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                style={{ fontSize: "16px" }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-email">Email</Label>
              <Input
                id="fb-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          {/* User Type - Updated categories */}
          <div className="space-y-2">
            <Label>What best describes you?</Label>
            <RadioGroup value={formData.userType} onValueChange={(v) => setFormData((p) => ({ ...p, userType: v }))}>
              {[
                { value: "blogger", label: "Blogger" },
                { value: "saas_founder", label: "SaaS / Startup founder" },
                { value: "seo_professional", label: "SEO professional" },
                { value: "content_agency", label: "Content agency" },
                { value: "consultant", label: "Consultant / Freelancer" },
              ].map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label htmlFor={opt.value} className="font-normal cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Questions */}
          <div className="space-y-2">
            <Label htmlFor="surprising">What surprised you most about your results?</Label>
            <Textarea
              id="surprising"
              placeholder="I didn't realize..."
              value={formData.surprisingResult}
              onChange={(e) => setFormData((p) => ({ ...p, surprisingResult: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="useful">What did you find most useful?</Label>
            <Textarea
              id="useful"
              placeholder="The code examples..."
              value={formData.mostUseful}
              onChange={(e) => setFormData((p) => ({ ...p, mostUseful: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommend">Would you recommend FoundIndex? Why?</Label>
            <Textarea
              id="recommend"
              placeholder="Yes, because..."
              value={formData.wouldRecommend}
              onChange={(e) => setFormData((p) => ({ ...p, wouldRecommend: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improve">What would make this more valuable?</Label>
            <Textarea
              id="improve"
              placeholder="It would be great if..."
              value={formData.improvements}
              onChange={(e) => setFormData((p) => ({ ...p, improvements: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Testimonial permissions */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-3">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              🎁 Get a backlink! If we feature your testimonial, we'll link to your site.
            </p>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="use-name"
                checked={formData.canUseName}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, canUseName: checked as boolean }))}
              />
              <Label htmlFor="use-name" className="text-sm cursor-pointer">
                You can use my name with my feedback
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="use-testimonial"
                checked={formData.canUseAsTestimonial}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, canUseAsTestimonial: checked as boolean }))}
              />
              <Label htmlFor="use-testimonial" className="text-sm cursor-pointer">
                You can feature my feedback as a testimonial on your site
              </Label>
            </div>

            {formData.canUseAsTestimonial && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="backlink" className="text-sm">
                  Your website (for backlink)
                </Label>
                <Input
                  id="backlink"
                  placeholder="https://yoursite.com"
                  value={formData.websiteForBacklink}
                  onChange={(e) => setFormData((p) => ({ ...p, websiteForBacklink: e.target.value }))}
                  style={{ fontSize: "16px" }}
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit feedback"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// AI REWRITE TEASER
// =============================================================================

const AIRewriteTeaser = ({ onContactClick }: { onContactClick: () => void }) => (
  <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        Coming soon: AI rewrite
      </CardTitle>
      <CardDescription>Don't just know what's wrong — get it fixed automatically</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">
        Our AI will rewrite your content to be AI-search optimized. Get ready-to-use HTML or plain text.
      </p>
      <Button variant="outline" onClick={onContactClick} className="gap-2">
        <ExternalLink className="h-4 w-4" />
        Get notified when it launches
      </Button>
    </CardContent>
  </Card>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [website, setWebsite] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const url = searchParams.get("url") || "";
  const testId = searchParams.get("testId");

  // Show 2 recommendations with problem visible (solution blurred)
  const FREE_WITH_PROBLEM = 2;

  useEffect(() => {
    analytics.pageView("results");

    // Check if already unlocked
    if (localStorage.getItem("fi_unlocked_email")) {
      setIsUnlocked(true);
    }

    if (!testId) {
      setLoadError("Missing test ID. Please start a new test.");
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadResults = async () => {
      try {
        console.log("[Results] Loading test:", testId);

        const { data, error } = await supabase.from("test_history").select("*").eq("test_id", testId).maybeSingle();

        if (error) {
          console.error("[Results] Supabase error:", error);
          throw error;
        }

        if (!data) {
          console.log("[Results] No data found for test:", testId);
          setLoadError("No results found. Please run a new analysis.");
          return;
        }

        console.log("[Results] Data loaded:", data);

        const testedWebsite = (data as { website?: string }).website || url;
        setWebsite(testedWebsite);

        const categoriesSource = ((data as { categories?: unknown }).categories || {}) as Record<string, unknown>;
        const testType = ((data as { test_type?: string }).test_type || "homepage") as "homepage" | "blog";

        const categories: CategorySummary[] = [];
        for (const [key, value] of Object.entries(categoriesSource)) {
          if (value && typeof value === "object") {
            const cat = value as {
              score?: number;
              max?: number;
              percentage?: number;
              details?: unknown;
              breakdown?: { summary?: string; scores?: Array<{ category: string; found: boolean }> };
            };
            categories.push({
              name: getCategoryDisplayName(key),
              key,
              score: cat.score ?? 0,
              max: cat.max ?? 0,
              percentage: cat.percentage ?? Math.round(((cat.score || 0) / (cat.max || 1)) * 100),
              details: cat.details,
              breakdown: cat.breakdown,
            });
          }
        }

        // Sort categories
        const deterministicKeys = ["schemaMarkup", "semanticStructure", "technicalFoundation", "images"];
        categories.sort((a, b) => {
          return (deterministicKeys.includes(a.key) ? 0 : 1) - (deterministicKeys.includes(b.key) ? 0 : 1);
        });

        const score = (data as { score?: number }).score ?? 0;
        const gradeMeta = getGradeInfo(score);

        const recommendations = ((data as { recommendations?: unknown[] }).recommendations || []).map(
          (rec: unknown, idx: number) => {
            const r = rec as Record<string, unknown>;
            return {
              id: (r.id as string) || `rec-${idx}`,
              priority: (r.priority as string) || "medium",
              title: (r.title as string) || "Recommendation",
              pointsLost: (r.pointsLost as number) || 0,
              problem: (r.problem as string) || "",
              howToFix: r.howToFix || [],
              codeExample: (r.codeExample as string) || "",
              expectedImprovement: (r.expectedImprovement as string) || "",
            };
          },
        ) as Recommendation[];

        // Calculate industry average
        let industryAverage = 58;
        try {
          const { data: avgData } = await supabase
            .from("test_history")
            .select("score")
            .eq("test_type", testType)
            .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

          if (avgData && avgData.length > 5) {
            industryAverage = Math.round(
              avgData.map((d: { score: number }) => d.score).reduce((a, b) => a + b, 0) / avgData.length,
            );
          }
        } catch (e) {
          console.warn("[Results] Could not calc industry avg:", e);
        }

        if (!isCancelled) {
          setResultData({
            score,
            grade: gradeMeta.grade,
            gradeLabel: gradeMeta.label,
            testType,
            categories,
            recommendations,
            criteriaCount: testType === "homepage" ? 47 : 52,
            industryAverage,
          });
        }
      } catch (error) {
        console.error("[Results] Failed to load:", error);
        if (!isCancelled) {
          setLoadError("Unable to load results. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadResults();
    return () => {
      isCancelled = true;
    };
  }, [testId, url]);

  // Share handler
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `My website scored ${resultData?.score}/100 on FoundIndex AI visibility test! Check yours:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My FoundIndex Score",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // User cancelled or not supported
      }
    }

    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  };

  // Download handler
  const handleDownload = () => {
    if (!isUnlocked) {
      setShowUnlockDialog(true);
      return;
    }

    if (!resultData) return;

    const report = `
FOUNDINDEX AI VISIBILITY REPORT
${"=".repeat(50)}

Website: ${website}
Test Type: ${resultData.testType === "homepage" ? "Homepage" : "Blog Post"}
Score: ${resultData.score}/100
Grade: ${resultData.grade} (${resultData.gradeLabel})
Industry Average: ${resultData.industryAverage}

${"=".repeat(50)}
CATEGORY BREAKDOWN
${"=".repeat(50)}

${resultData.categories.map((c) => `${c.name}: ${c.score}/${c.max} (${c.percentage}%)`).join("\n")}

${"=".repeat(50)}
ALL RECOMMENDATIONS
${"=".repeat(50)}

${resultData.recommendations
  .map(
    (r, i) => `
${i + 1}. [${r.priority.toUpperCase()}] ${r.title}
   Points lost: ${r.pointsLost}
   
   Problem:
   ${r.problem}
   
   How to fix:
   ${ensureArray(r.howToFix)
     .map((s) => `   • ${s}`)
     .join("\n")}
   
   ${r.codeExample ? `Code example:\n   ${r.codeExample.split("\n").join("\n   ")}` : ""}
   
   Expected improvement: ${r.expectedImprovement}
`,
  )
  .join("\n---\n")}

${"=".repeat(50)}
Generated by FoundIndex.com on ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `foundindex-report-${website.replace(/[^a-z0-9]/gi, "-")}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const gradeInfo = getGradeInfo(resultData?.score ?? 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-64 w-96 mx-auto mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  // Error state
  if (loadError || !resultData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError || "No results available."}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/")} className="w-full md:w-auto">
            Back to homepage
          </Button>
        </main>
      </div>
    );
  }

  // Split recommendations
  const freeRecs = resultData.recommendations.slice(0, FREE_WITH_PROBLEM);
  const lockedRecs = resultData.recommendations.slice(FREE_WITH_PROBLEM);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                resultData.testType === "homepage"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
              }`}
            >
              {resultData.testType === "homepage" ? <Home className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {resultData.testType === "homepage" ? "Homepage analysis" : "Blog post analysis"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Results for: <span className="font-semibold break-all">{website}</span>
          </p>
        </div>

        {/* Beta banner */}
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-300 font-medium">
            🎉 Beta access: All features unlocked free
          </AlertDescription>
        </Alert>

        {/* Speedometer */}
        <div className="text-center mb-12">
          <SpeedometerGauge score={resultData.score} />
          <div className="mt-4">
            <div className={`text-2xl md:text-3xl font-bold ${gradeInfo.color}`}>
              Grade: {gradeInfo.grade} ({gradeInfo.label})
            </div>
            <p className="text-sm text-muted-foreground">
              Analyzed {resultData.criteriaCount} criteria across {resultData.categories.length} categories
            </p>
          </div>

          {/* Share & Download */}
          <div className="flex justify-center gap-3 mt-6">
            <div className="relative">
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              {shareTooltip && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-foreground text-background rounded whitespace-nowrap">
                  Copied to clipboard!
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              {isUnlocked ? "Download report" : "Download (unlock first)"}
            </Button>
          </div>
        </div>

        {/* Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Category breakdown</CardTitle>
            <CardDescription>
              {resultData.testType === "homepage"
                ? "How well your homepage signals clarity to AI"
                : "How well your blog answers questions for AI"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {resultData.categories.map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{cat.name}</span>
                  <span className="font-semibold">{cat.percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      cat.percentage >= 70 ? "bg-green-500" : cat.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                {cat.key === "schemaMarkup" && cat.breakdown?.summary && (
                  <p className="text-xs text-muted-foreground pl-2">{cat.breakdown.summary}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Industry comparison */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle>📊 Industry comparison</CardTitle>
            <CardDescription>Based on {resultData.testType} tests from the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Your score:</span>
              <span className="text-2xl font-bold">{resultData.score}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-muted-foreground">Industry average:</span>
              <span className="text-2xl font-bold">{resultData.industryAverage}</span>
            </div>
            <p
              className={`font-semibold ${resultData.score >= resultData.industryAverage ? "text-green-600" : "text-orange-600"}`}
            >
              {resultData.score > resultData.industryAverage
                ? `You're ${resultData.score - resultData.industryAverage} points above average 🎯`
                : resultData.score === resultData.industryAverage
                  ? "You're at average. Room to improve!"
                  : `You're ${resultData.industryAverage - resultData.score} points below average. Let's fix that.`}
            </p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📋 Recommendations</CardTitle>
            <CardDescription>
              {resultData.recommendations.filter((r) => r.priority === "critical").length} critical issues found
              {!isUnlocked && lockedRecs.length > 0 && (
                <span className="ml-2 text-primary font-medium">• {lockedRecs.length} more locked</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Unlocked view */}
            {isUnlocked ? (
              <Accordion type="single" collapsible className="w-full">
                {resultData.recommendations.map((rec) => (
                  <UnlockedRecommendation key={rec.id} rec={rec} />
                ))}
              </Accordion>
            ) : (
              <>
                {/* Free recs - show problem, blur solution */}
                {freeRecs.map((rec) => (
                  <FreeRecommendation key={rec.id} rec={rec} onUnlock={() => setShowUnlockDialog(true)} />
                ))}

                {/* Locked recs - fully blurred */}
                {lockedRecs.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                      <Lock className="h-4 w-4" />
                      {lockedRecs.length} more recommendations
                    </div>

                    {lockedRecs.slice(0, 2).map((rec) => (
                      <LockedRecommendation key={rec.id} rec={rec} onUnlock={() => setShowUnlockDialog(true)} />
                    ))}

                    {lockedRecs.length > 2 && (
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        + {lockedRecs.length - 2} more recommendations
                      </p>
                    )}

                    <Button onClick={() => setShowUnlockDialog(true)} className="w-full gap-2">
                      <Lock className="h-4 w-4" />
                      Unlock all {resultData.recommendations.length} recommendations
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Rewrite Teaser */}
        <AIRewriteTeaser onContactClick={() => navigate("/contact")} />

        {/* Feedback */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>💬 Share feedback, get a backlink</CardTitle>
            <CardDescription>
              Help us improve — if we feature your testimonial, we'll link to your site!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowFeedbackDialog(true)} variant="outline" className="w-full">
              Share your feedback
            </Button>
          </CardContent>
        </Card>

        {/* Retest */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>🔄 Implement and retest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Make the changes, then check your new score</p>
            <Button onClick={() => navigate("/")} className="w-full min-h-[48px]" size="lg">
              Test another URL
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <EmailUnlockDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        onUnlock={() => setIsUnlocked(true)}
        website={website}
        testId={testId}
      />

      <TestimonialFeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
        website={website}
        testId={testId}
        score={resultData.score}
      />
    </div>
  );
}
