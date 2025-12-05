import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  Lock,
  Unlock,
  Star,
  Sparkles,
  FileText,
  Loader2,
  ArrowLeft,
  MessageSquare,
  TrendingUp,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// =============================================================================
// TYPES
// =============================================================================

interface Category {
  score: number;
  max: number;
  percentage: number;
  breakdown?: unknown;
  details?: unknown;
}

interface Recommendation {
  id: string;
  priority: "critical" | "medium" | "good";
  title: string;
  pointsLost: number;
  problem: string;
  howToFix: string[];
  codeExample?: string;
  expectedImprovement: string | number;
}

interface ResultData {
  testId: string;
  score: number;
  grade: string;
  detectedType: string;
  requestedType: string;
  categories: Record<string, Category>;
  recommendations: Recommendation[];
  industryAverage: number;
  criteriaCount: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Category display names
const CATEGORY_NAMES: Record<string, string> = {
  schemaMarkup: "Schema Markup",
  semanticStructure: "Semantic Structure",
  technicalFoundation: "Technical Foundation",
  images: "Image Optimization",
  contentClarity: "Content Clarity",
  answerStructure: "Answer Structure",
  authoritySignals: "Authority Signals",
  scannability: "Scannability",
  expertiseSignals: "Expertise Signals",
  faqSchema: "FAQ Schema",
  technicalSEO: "Technical SEO",
};

// Grade labels
const GRADE_LABELS: Record<string, string> = {
  A: "Excellent",
  B: "Strong",
  C: "Average",
  D: "Needs Work",
  F: "Critical",
};

// Grade colors
const GRADE_COLORS: Record<string, string> = {
  A: "text-green-600",
  B: "text-green-500",
  C: "text-yellow-500",
  D: "text-orange-500",
  F: "text-red-500",
};

// Priority colors
const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  good: "bg-green-100 text-green-700 border-green-200",
};

const PRIORITY_ICONS: Record<string, React.ReactNode> = {
  critical: <AlertCircle className="h-4 w-4" />,
  medium: <TrendingUp className="h-4 w-4" />,
  good: <CheckCircle2 className="h-4 w-4" />,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get color based on score percentage (0-100)
// 0-39: Red, 40-69: Orange, 70-84: Yellow/Amber, 85-100: Green
const getScoreColor = (percentage: number): { bg: string; text: string; hex: string } => {
  if (percentage >= 85) return { bg: "bg-emerald-500", text: "text-emerald-600", hex: "#10B981" };
  if (percentage >= 70) return { bg: "bg-amber-400", text: "text-amber-600", hex: "#FBBF24" };
  if (percentage >= 40) return { bg: "bg-orange-500", text: "text-orange-600", hex: "#F59E0B" };
  return { bg: "bg-red-500", text: "text-red-600", hex: "#EF4444" };
};

// Category tooltips
const CATEGORY_TOOLTIPS: Record<string, string> = {
  contentClarity: "Measures how explicitly your homepage states what you do, who you serve, and what problems you solve. AI systems need clear, direct language.",
  technicalFoundation: "Evaluates schema markup, heading structure, and machine-readable elements that help AI parse your content.",
  semanticStructure: "Analyzes content organization, FAQ sections, and information architecture for AI comprehension.",
  authoritySignals: "Checks for testimonials, credentials, case studies, and credibility markers AI systems trust.",
  answerStructure: "Measures whether key information (pricing, services, contact) is easily discoverable.",
  scannability: "Evaluates how easily AI can scan and extract key points from your content structure.",
  expertiseSignals: "Checks for author credentials, expertise indicators, and trust markers.",
  faqSchema: "Evaluates FAQ structured data and question-answer formatting for AI comprehension.",
  technicalSEO: "Analyzes technical SEO elements that improve AI discoverability.",
  schemaMarkup: "Evaluates structured data markup that helps AI understand your content.",
  images: "Checks image optimization, alt text, and visual content accessibility for AI.",
};

// Format expected improvement to always show "+" suffix
// FIX: Handle both string and number types from database
const formatExpectedImprovement = (improvement: string | number | undefined): string => {
  if (!improvement && improvement !== 0) return "";

  // Convert to string if it's a number
  const improvementStr = String(improvement);

  // If it already ends with "+", return as is
  if (improvementStr.endsWith("+")) return improvementStr;

  // Extract number and add "+"
  // Handle formats like "+4 points", "4 points", "+4", "4"
  const match = improvementStr.match(/\+?(\d+)\s*(points?)?/i);
  if (match) {
    const num = match[1];
    return `+${num}+ points`;
  }

  return improvementStr;
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Speedometer gauge component with updated color zones
const SpeedometerGauge = ({ score }: { score: number }) => {
  const rotation = -90 + (score / 100) * 180;
  const scoreColor = getScoreColor(score);

  return (
    <div className="relative w-64 h-40 mx-auto">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        {/* Background arc */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
        {/* Red zone (0-39) */}
        <path d="M 20 100 A 80 80 0 0 1 50 42" fill="none" stroke="#EF4444" strokeWidth="12" strokeLinecap="round" />
        {/* Orange zone (40-69) */}
        <path d="M 50 42 A 80 80 0 0 1 124 22" fill="none" stroke="#F59E0B" strokeWidth="12" strokeLinecap="round" />
        {/* Yellow/Amber zone (70-84) */}
        <path d="M 124 22 A 80 80 0 0 1 156 46" fill="none" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" />
        {/* Green zone (85-100) */}
        <path d="M 156 46 A 80 80 0 0 1 180 100" fill="none" stroke="#10B981" strokeWidth="12" strokeLinecap="round" />
        {/* Needle */}
        <g transform={`rotate(${rotation}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="35" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="8" fill="#1f2937" />
        </g>
        {/* Score labels */}
        <text x="15" y="115" fontSize="10" fill="#6b7280">0</text>
        <text x="40" y="55" fontSize="10" fill="#6b7280">40</text>
        <text x="120" y="35" fontSize="10" fill="#6b7280">70</text>
        <text x="155" y="55" fontSize="10" fill="#6b7280">85</text>
        <text x="170" y="115" fontSize="10" fill="#6b7280">100</text>
      </svg>
      {/* Center score display */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
        <div className={`text-5xl font-bold ${scoreColor.text}`}>{score}</div>
        <div className="text-sm text-gray-500">out of 100</div>
      </div>
    </div>
  );
};

// Category progress bar with color coding and tooltip
const CategoryProgressBar = ({ 
  categoryKey, 
  category, 
  displayName 
}: { 
  categoryKey: string; 
  category: { score: number; max: number; percentage: number }; 
  displayName: string;
}) => {
  const color = getScoreColor(category.percentage);
  const tooltip = CATEGORY_TOOLTIPS[categoryKey] || `Score for ${displayName}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{displayName}</span>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-3.5 w-3.5" />
                  <span className="sr-only">More info about {displayName}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-sm">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className={`text-sm font-semibold ${color.text}`}>
          {category.percentage}%
        </span>
      </div>
      {/* Progress bar container */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-500 ease-out ${color.bg}`}
          style={{ width: `${category.percentage}%` }}
        />
        {/* Percentage label inside bar (for larger percentages) */}
        {category.percentage >= 25 && (
          <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-medium text-white">
            {category.score}/{category.max}
          </span>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// UNLOCK EMAIL DIALOG
// =============================================================================

interface UnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
  website: string;
  testId: string;
}

const UnlockEmailDialog = ({ open, onOpenChange, onUnlock, website, testId }: UnlockDialogProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Pre-fill email if previously unlocked
  useEffect(() => {
    const savedEmail = localStorage.getItem("fi_unlocked_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Strict email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address (e.g., you@example.com)");
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
        // Don't throw - still unlock for user but log the error
      }

      // Store in localStorage
      localStorage.setItem("fi_unlocked_email", email.trim().toLowerCase());

      toast({
        title: "Results unlocked!",
        description: "You now have access to all recommendations and code examples.",
      });

      onUnlock();
      onOpenChange(false);
    } catch (err) {
      console.error("Unlock error:", err);
      // Still unlock even if save fails
      localStorage.setItem("fi_unlocked_email", email.trim().toLowerCase());
      onUnlock();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-primary" />
            Unlock all recommendations
          </DialogTitle>
          <DialogDescription>Get step-by-step fixes and code examples for all issues.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="unlock-email">Email address</Label>
            <Input
              id="unlock-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              className={error ? "border-red-500" : ""}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">You'll get:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                All recommendations unlocked
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Copy-paste code examples
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Priority-sorted action list
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Downloadable report
              </li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">No spam. We only email about your results.</p>

          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Unlocking...
              </>
            ) : (
              "Unlock all recommendations"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// FEEDBACK DIALOG (with testimonial option)
// =============================================================================

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId: string;
  website: string;
  score: number;
}

const FeedbackDialog = ({ open, onOpenChange, testId, website, score }: FeedbackDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: localStorage.getItem("fi_unlocked_email") || "",
    userType: "",
    surprisingResult: "",
    mostUseful: "",
    wouldRecommend: "",
    improvements: "",
    canUseName: false,
    canFeatureTestimonial: false,
    backlinkUrl: "",
  });

  const handleSubmit = async () => {
    if (!formData.email.trim()) {
      toast({ title: "Email required", description: "Please enter your email", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("feedback").insert({
        test_id: testId,
        website: website,
        email: formData.email.trim().toLowerCase(),
        score: score,
        user_type: formData.userType,
        surprising_result: formData.surprisingResult,
        describe_to_colleague: formData.wouldRecommend,
        preventing_improvements: formData.improvements,
      });

      if (error) {
        console.error("Feedback save error:", error);
      }

      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: formData.canFeatureTestimonial
          ? "We'll be in touch about featuring your testimonial and adding your backlink."
          : "Your feedback helps us improve FoundIndex.",
      });

      setTimeout(() => {
        onOpenChange(false);
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error("Feedback error:", err);
      toast({ title: "Error", description: "Could not save feedback. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Thank you!</h3>
            <p className="text-muted-foreground">Your feedback has been submitted.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share your feedback
          </DialogTitle>
          <DialogDescription>Help us improve FoundIndex. Your feedback is valuable!</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fb-name">Name (optional)</Label>
              <Input
                id="fb-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="fb-email">Email *</Label>
              <Input
                id="fb-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <Label>What best describes you?</Label>
            <RadioGroup
              value={formData.userType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, userType: value }))}
              className="grid grid-cols-2 gap-2 mt-2"
            >
              {[
                { value: "blogger", label: "Blogger" },
                { value: "saas_founder", label: "SaaS/Startup founder" },
                { value: "seo_professional", label: "SEO professional" },
                { value: "content_agency", label: "Content agency" },
                { value: "consultant", label: "Consultant/Freelancer" },
                { value: "other", label: "Other" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="fb-surprising">Was anything surprising about your score?</Label>
            <Textarea
              id="fb-surprising"
              value={formData.surprisingResult}
              onChange={(e) => setFormData((prev) => ({ ...prev, surprisingResult: e.target.value }))}
              placeholder="Tell us what surprised you..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="fb-useful">What was most useful?</Label>
            <Textarea
              id="fb-useful"
              value={formData.mostUseful}
              onChange={(e) => setFormData((prev) => ({ ...prev, mostUseful: e.target.value }))}
              placeholder="Which recommendations helped most..."
              rows={2}
            />
          </div>

          <div>
            <Label>Would you recommend FoundIndex?</Label>
            <RadioGroup
              value={formData.wouldRecommend}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, wouldRecommend: value }))}
              className="flex gap-4 mt-2"
            >
              {["Definitely", "Probably", "Not sure", "No"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.toLowerCase()} id={`rec-${option}`} />
                  <Label htmlFor={`rec-${option}`} className="text-sm font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="fb-improvements">What would make this more useful?</Label>
            <Textarea
              id="fb-improvements"
              value={formData.improvements}
              onChange={(e) => setFormData((prev) => ({ ...prev, improvements: e.target.value }))}
              placeholder="Features, improvements, or suggestions..."
              rows={2}
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Testimonial permissions</p>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="can-use-name"
                checked={formData.canUseName}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, canUseName: checked as boolean }))}
              />
              <Label htmlFor="can-use-name" className="text-sm font-normal cursor-pointer">
                You can use my name with my feedback
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="can-feature"
                checked={formData.canFeatureTestimonial}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, canFeatureTestimonial: checked as boolean }))
                }
              />
              <Label htmlFor="can-feature" className="text-sm font-normal cursor-pointer">
                You can feature my feedback as a testimonial on your site
              </Label>
            </div>

            {formData.canFeatureTestimonial && (
              <div className="ml-6">
                <Label htmlFor="backlink-url" className="text-sm">
                  Your website (we'll add a backlink as thanks!)
                </Label>
                <Input
                  id="backlink-url"
                  value={formData.backlinkUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, backlinkUrl: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Featured testimonials get a dofollow backlink from our site.
                </p>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit feedback"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =============================================================================
// RECOMMENDATION CARD COMPONENT
// =============================================================================

interface RecommendationCardProps {
  rec: Recommendation;
  index: number;
  isUnlocked: boolean;
  onUnlock: () => void;
}

const RecommendationCard = ({ rec, index, isUnlocked, onUnlock }: RecommendationCardProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (rec.codeExample) {
      navigator.clipboard.writeText(rec.codeExample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // First 2 recommendations (index 0, 1): Show title + problem, blur solution
  // Recommendations 3+ (index 2, 3, 4...): Blur everything
  const isFullyLocked = index >= 2 && !isUnlocked;
  const isSolutionLocked = index < 2 && !isUnlocked;

  // If fully locked (recommendations 3+), show blurred card
  if (isFullyLocked) {
    return (
      <div className="relative border rounded-lg overflow-hidden">
        {/* Blurred content */}
        <div className="blur-sm select-none pointer-events-none p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-gray-100">
              <AlertCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-gray-100 text-gray-500">
                  {rec.priority}
                </Badge>
                <span className="font-medium text-gray-400">Hidden recommendation</span>
              </div>
              <p className="text-sm text-gray-400">
                This recommendation is locked. Enter your email to unlock all recommendations and see the full details.
              </p>
            </div>
          </div>
        </div>

        {/* Overlay with unlock button */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
          <Button onClick={onUnlock} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Lock className="h-4 w-4" />
            Unlock with email
          </Button>
        </div>
      </div>
    );
  }

  // For first 2 recommendations OR unlocked state
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={rec.id} className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <div className="flex items-center gap-3 text-left">
            <div className={`p-1.5 rounded ${PRIORITY_COLORS[rec.priority]}`}>{PRIORITY_ICONS[rec.priority]}</div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={PRIORITY_COLORS[rec.priority]}>
                  {rec.priority}
                </Badge>
                <span className="font-medium">{rec.title}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{rec.problem}</p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-4 pb-4">
          {/* If solution is locked (first 2 recs, not unlocked yet) */}
          {isSolutionLocked ? (
            <div className="relative mt-2">
              {/* Blurred solution content */}
              <div className="blur-sm select-none pointer-events-none space-y-4">
                <div>
                  <h5 className="font-medium mb-2">How to fix:</h5>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Step 1: Implementation details hidden...</li>
                    <li>Step 2: Code example locked...</li>
                    <li>Step 3: Expected improvement hidden...</li>
                  </ul>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-xs">// Code example locked...</code>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                <Button onClick={onUnlock} variant="secondary" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Unlock solution
                </Button>
              </div>
            </div>
          ) : (
            /* Fully unlocked content */
            <div className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">How to fix:</h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {Array.isArray(rec.howToFix) ? (
                    rec.howToFix.map((step, i) => <li key={i}>{step}</li>)
                  ) : (
                    <li>{rec.howToFix || "See details above"}</li>
                  )}
                </ul>
              </div>

              {rec.codeExample && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">Code example:</h5>
                    <Button variant="ghost" size="sm" onClick={copyCode}>
                      <Copy className="h-4 w-4 mr-1" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                    <code>{rec.codeExample}</code>
                  </pre>
                </div>
              )}

              {rec.expectedImprovement && (
                <p className="text-sm text-green-600 font-medium">
                  Expected: {formatExpectedImprovement(rec.expectedImprovement)}
                </p>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// =============================================================================
// MAIN RESULTS PAGE
// =============================================================================

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const testId = searchParams.get("testId");
  const urlParam = searchParams.get("url");

  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Check if already unlocked
  // BETA TESTING: Set to false to always show blur, change to true for production
  const BETA_ALWAYS_SHOW_BLUR = true;

  useEffect(() => {
    if (BETA_ALWAYS_SHOW_BLUR) {
      // During beta testing, always start locked to verify blur works
      setIsUnlocked(false);
      return;
    }

    const savedEmail = localStorage.getItem("fi_unlocked_email");
    if (savedEmail) {
      setIsUnlocked(true);
    }
  }, []);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!testId) {
        setError("No test ID provided");
        setIsLoading(false);
        return;
      }

      console.log("[Results] Loading test:", testId);

      try {
        // First try to get from URL params (fresh result)
        const urlData = searchParams.get("data");
        if (urlData) {
          try {
            const parsed = JSON.parse(decodeURIComponent(urlData));
            setResultData(parsed);
            setIsLoading(false);
            return;
          } catch {
            // Continue to fetch from DB
          }
        }

        // Fetch from Edge Function (bypasses RLS)
        const { data: fnData, error: fnError } = await supabase.functions.invoke("fetch-results", {
          body: { testId },
        });

        if (fnError) {
          console.error("[Results] Edge function error:", fnError);
          throw fnError;
        }

        if (!fnData || fnData.error) {
          console.log("[Results] No data found for test:", testId, fnData?.error);
          throw new Error(fnData?.error || "Test not found");
        }

        console.log("[Results] Data loaded:", fnData);

        setResultData({
          testId: fnData.testId,
          score: fnData.score,
          grade: fnData.grade,
          detectedType: fnData.detectedType,
          requestedType: fnData.testType,
          categories: fnData.categories as unknown as Record<string, Category>,
          recommendations: fnData.recommendations as unknown as Recommendation[],
          industryAverage: 58,
          criteriaCount: fnData.testType === "homepage" ? 47 : 52,
        });
      } catch (err) {
        console.error("[Results] Error:", err);
        setError("Could not load results. Please try testing again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [testId, searchParams]);

  // Share functionality
  const handleShare = async () => {
    const shareText = `My website scored ${resultData?.score}/100 on FoundIndex AI visibility test! Check yours:`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FoundIndex Score",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopiedShare(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Download report
  const handleDownload = () => {
    if (!isUnlocked) {
      setShowUnlockDialog(true);
      return;
    }

    if (!resultData) return;

    const report = `
FOUNDINDEX AI VISIBILITY REPORT
================================
Website: ${urlParam || "Unknown"}
Score: ${resultData.score}/100
Grade: ${resultData.grade}
Test Type: ${resultData.requestedType}
Date: ${new Date().toLocaleDateString()}

CATEGORY BREAKDOWN
------------------
${Object.entries(resultData.categories)
  .map(([key, cat]) => `${CATEGORY_NAMES[key] || key}: ${cat.score}/${cat.max} (${cat.percentage}%)`)
  .join("\n")}

RECOMMENDATIONS
---------------
${resultData.recommendations
  .map(
    (rec, i) => `
${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}
   Problem: ${rec.problem}
   Fix: ${Array.isArray(rec.howToFix) ? rec.howToFix.join("; ") : rec.howToFix}
   ${rec.codeExample ? `Code: ${rec.codeExample}` : ""}
   Expected: ${formatExpectedImprovement(rec.expectedImprovement)}
`,
  )
  .join("\n")}

Generated by FoundIndex.com
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foundindex-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">Results Not Found</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={() => navigate("/")} className="mt-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Test another website
          </Button>
        </div>
      </div>
    );
  }

  const website = urlParam ? decodeURIComponent(urlParam) : "your website";
  const isHomepage = resultData.requestedType === "homepage";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Test another URL
        </Button>

        {/* Test type badge */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {isHomepage ? "Homepage analysis" : "Blog post analysis"}
          </Badge>
        </div>

        {/* URL */}
        <p className="text-muted-foreground mb-6">Results for: {website}</p>

        {/* Beta banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <p className="text-green-800 flex items-center gap-2">
            🎉 <span className="font-medium">Beta access: All features unlocked free</span>
          </p>
        </div>

        {/* Score card */}
        <Card className="mb-8">
          <CardContent className="pt-8 pb-6">
            <SpeedometerGauge score={resultData.score} />

            <div className="text-center mt-4">
              <h2 className={`text-3xl font-bold ${GRADE_COLORS[resultData.grade]}`}>
                Grade: {resultData.grade} ({GRADE_LABELS[resultData.grade]})
              </h2>
              <p className="text-muted-foreground mt-1">
                Analyzed {resultData.criteriaCount} criteria across {Object.keys(resultData.categories).length}{" "}
                categories
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                {copiedShare ? "Copied!" : "Share"}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Category breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              How well your {isHomepage ? "homepage" : "blog"}{" "}
              {isHomepage ? "signals clarity to AI" : "answers questions for AI"}
            </p>
            {/* Color legend */}
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Critical (0-39%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">Needs work (40-69%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-muted-foreground">Good (70-84%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Excellent (85-100%)</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(resultData.categories).map(([key, category]) => (
              <CategoryProgressBar
                key={key}
                categoryKey={key}
                category={category}
                displayName={CATEGORY_NAMES[key] || key}
              />
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <p className="text-sm text-muted-foreground">
              {resultData.recommendations.length} issues found, sorted by priority
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultData.recommendations.map((rec, index) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                index={index}
                isUnlocked={isUnlocked}
                onUnlock={() => setShowUnlockDialog(true)}
              />
            ))}
          </CardContent>
        </Card>

        {/* AI Rewrite teaser */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Coming soon: AI rewrite</h3>
                <p className="text-muted-foreground mt-1">Don't just know what's wrong — get it fixed automatically</p>
                <Button variant="outline" className="mt-3" onClick={() => navigate("/contact")}>
                  Get notified when it launches
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback CTA */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">How was your experience?</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Share your feedback and get featured on our site (with a backlink!)
            </p>
            <Button onClick={() => setShowFeedbackDialog(true)}>Share feedback</Button>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Implement and retest</h3>
          <p className="text-muted-foreground mb-4">Make the changes, then check your new score</p>
          <Button onClick={() => navigate("/")}>Test another URL</Button>
        </div>
      </main>

      {/* Dialogs */}
      <UnlockEmailDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        onUnlock={() => setIsUnlocked(true)}
        website={website}
        testId={testId || ""}
      />

      <FeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
        testId={testId || ""}
        website={website}
        score={resultData.score}
      />
    </div>
  );
};

export default Results;
