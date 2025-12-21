import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Table, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

interface Category {
  score: number;
  max: number;
  percentage: number;
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

interface AIInterpretationData {
  interpretation: string;
  industry: string;
  audience: string;
  problem: string;
  solution: string;
  confidenceScore: number;
  confidenceBreakdown: {
    hasAudience: boolean;
    hasProblem: boolean;
    hasSolution: boolean;
    isSpecific: boolean;
  };
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
  createdAt?: string;
  aiInterpretation?: AIInterpretationData | null;
}

interface DownloadReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultData: ResultData;
  website: string;
  categoryNames: Record<string, string>;
}

const formatExpectedImprovement = (improvement: string | number | undefined): string => {
  if (!improvement && improvement !== 0) return "";
  const improvementStr = String(improvement);
  if (improvementStr.endsWith("+")) return improvementStr;
  const match = improvementStr.match(/\+?(\d+)\s*(points?)?/i);
  if (match) {
    const num = match[1];
    return `+${num}+ points`;
  }
  return improvementStr;
};

const getConfidenceLabel = (score: number): string => {
  if (score >= 90) return "Crystal Clear";
  if (score >= 75) return "Mostly Clear";
  if (score >= 60) return "Somewhat Unclear";
  return "Needs Improvement";
};

export const DownloadReportDialog = ({
  open,
  onOpenChange,
  resultData,
  website,
  categoryNames,
}: DownloadReportDialogProps) => {
  const [includeAI, setIncludeAI] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<"pdf" | "csv" | null>(null);

  const hasAIData = !!resultData.aiInterpretation;

  const generatePDF = async () => {
    setIsDownloading(true);
    setDownloadType("pdf");

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Helper to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPos + requiredHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };

      // Helper to wrap text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageBreak(8);
          pdf.text(line, x, yPos);
          yPos += fontSize * 0.5;
        });
        return yPos;
      };

      // Title
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("FoundIndex AI Visibility Report", margin, yPos);
      yPos += 12;

      // Website and date
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Website: ${website}`, margin, yPos);
      yPos += 6;
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
      yPos += 6;
      pdf.text(`Test Type: ${resultData.requestedType === "homepage" ? "Homepage Analysis" : "Blog Post Analysis"}`, margin, yPos);
      yPos += 15;

      // Score section
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Overall Score", margin, yPos);
      yPos += 10;

      pdf.setFontSize(36);
      pdf.text(`${resultData.score}/100`, margin, yPos);
      yPos += 12;

      pdf.setFontSize(14);
      pdf.text(`Grade: ${resultData.grade}`, margin, yPos);
      yPos += 20;

      // AI Interpretation Section (if enabled and available)
      if (includeAI && hasAIData && resultData.aiInterpretation) {
        const ai = resultData.aiInterpretation;

        checkPageBreak(80);
        
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("How AI Systems See You", margin, yPos);
        yPos += 10;

        // Confidence badge
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const confidenceLabel = getConfidenceLabel(ai.confidenceScore);
        pdf.text(`Confidence: ${ai.confidenceScore}% - ${confidenceLabel}`, margin, yPos);
        yPos += 10;

        // Interpretation
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "italic");
        addWrappedText(ai.interpretation, margin, yPos, contentWidth, 11);
        yPos += 8;

        // Breakdown checklist
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("What AI Found:", margin, yPos);
        yPos += 7;

        pdf.setFont("helvetica", "normal");
        const checklistItems = [
          { label: "Specific industry/niche", value: ai.confidenceBreakdown.isSpecific },
          { label: "Target customer type", value: ai.confidenceBreakdown.hasAudience },
          { label: "Problem you solve", value: ai.confidenceBreakdown.hasProblem },
          { label: "Unique method/advantage", value: ai.confidenceBreakdown.hasSolution },
        ];

        checklistItems.forEach((item) => {
          const icon = item.value ? "✓" : "✗";
          pdf.text(`  ${icon} ${item.label}`, margin, yPos);
          yPos += 6;
        });
        yPos += 5;

        // Quick fix template (if score < 75)
        if (ai.confidenceScore < 75) {
          checkPageBreak(40);
          pdf.setFont("helvetica", "bold");
          pdf.text("Suggested Fix Template:", margin, yPos);
          yPos += 7;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          addWrappedText(
            "[We help] [specific customer type] [solve specific problem] [by your unique method]",
            margin,
            yPos,
            contentWidth,
            10
          );
          yPos += 5;

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "italic");
          addWrappedText(
            'Example: "We help marketing agencies reduce meeting time by 80% using AI-powered meeting transcription."',
            margin,
            yPos,
            contentWidth,
            9
          );
        }

        yPos += 15;
      }

      // Category Breakdown
      checkPageBreak(50);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Category Breakdown", margin, yPos);
      yPos += 12;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      Object.entries(resultData.categories).forEach(([key, cat]) => {
        checkPageBreak(10);
        const name = categoryNames[key] || key;
        pdf.text(`${name}: ${cat.score}/${cat.max} (${cat.percentage}%)`, margin, yPos);
        yPos += 7;
      });

      yPos += 10;

      // Recommendations
      checkPageBreak(30);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Recommendations", margin, yPos);
      yPos += 12;

      resultData.recommendations.forEach((rec, i) => {
        checkPageBreak(40);

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`, margin, yPos);
        yPos += 8;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        addWrappedText(`Problem: ${rec.problem}`, margin + 5, yPos, contentWidth - 10, 10);
        yPos += 3;

        const fixText = Array.isArray(rec.howToFix) ? rec.howToFix.join("; ") : rec.howToFix;
        addWrappedText(`Fix: ${fixText}`, margin + 5, yPos, contentWidth - 10, 10);
        yPos += 3;

        if (rec.expectedImprovement) {
          pdf.text(`Expected: ${formatExpectedImprovement(rec.expectedImprovement)}`, margin + 5, yPos);
          yPos += 8;
        }

        yPos += 5;
      });

      // Footer
      checkPageBreak(20);
      yPos += 10;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.text("Generated by FoundIndex.com", margin, yPos);

      // Save
      pdf.save(`foundindex-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
      onOpenChange(false);
    }
  };

  const generateCSV = () => {
    setIsDownloading(true);
    setDownloadType("csv");

    try {
      const ai = resultData.aiInterpretation;
      
      // Build headers
      let headers = [
        "website",
        "score",
        "grade",
        "test_type",
        "test_date",
      ];

      // Category headers
      Object.keys(resultData.categories).forEach((key) => {
        const name = categoryNames[key] || key;
        headers.push(`${name.toLowerCase().replace(/\s+/g, "_")}_score`);
        headers.push(`${name.toLowerCase().replace(/\s+/g, "_")}_percentage`);
      });

      // AI headers (if enabled)
      if (includeAI && hasAIData) {
        headers = headers.concat([
          "ai_interpretation",
          "ai_confidence_score",
          "ai_industry",
          "ai_audience",
          "ai_problem",
          "ai_solution",
          "ai_has_audience",
          "ai_has_problem",
          "ai_has_solution",
          "ai_is_specific",
        ]);
      }

      // Recommendation count
      headers.push("recommendation_count");

      // Build row values
      let values: string[] = [
        website,
        String(resultData.score),
        resultData.grade,
        resultData.requestedType,
        new Date().toISOString().split("T")[0],
      ];

      // Category values
      Object.values(resultData.categories).forEach((cat) => {
        values.push(String(cat.score));
        values.push(String(cat.percentage));
      });

      // AI values (if enabled)
      if (includeAI && hasAIData && ai) {
        values = values.concat([
          `"${ai.interpretation.replace(/"/g, '""')}"`,
          String(ai.confidenceScore),
          `"${ai.industry.replace(/"/g, '""')}"`,
          `"${ai.audience.replace(/"/g, '""')}"`,
          `"${ai.problem.replace(/"/g, '""')}"`,
          `"${ai.solution.replace(/"/g, '""')}"`,
          String(ai.confidenceBreakdown.hasAudience),
          String(ai.confidenceBreakdown.hasProblem),
          String(ai.confidenceBreakdown.hasSolution),
          String(ai.confidenceBreakdown.isSpecific),
        ]);
      }

      // Recommendation count
      values.push(String(resultData.recommendations.length));

      // Build CSV content
      const csvContent = [headers.join(","), values.join(",")].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `foundindex-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV generation error:", error);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Download Report
          </DialogTitle>
          <DialogDescription>
            Export your AI visibility report in your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Interpretation option */}
          {hasAIData && (
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="include-ai"
                checked={includeAI}
                onCheckedChange={(checked) => setIncludeAI(checked === true)}
              />
              <div className="flex-1">
                <Label htmlFor="include-ai" className="text-sm font-medium cursor-pointer">
                  Include AI Interpretation
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add "How AI Systems See You" section with confidence score
                </p>
              </div>
            </div>
          )}

          {/* Format buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={generatePDF}
              disabled={isDownloading}
              className="flex flex-col items-center gap-2 h-auto py-4"
              variant="outline"
            >
              {isDownloading && downloadType === "pdf" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <FileText className="h-6 w-6 text-red-500" />
              )}
              <span className="font-medium">PDF Report</span>
              <span className="text-xs text-muted-foreground">Full formatted report</span>
            </Button>

            <Button
              onClick={generateCSV}
              disabled={isDownloading}
              className="flex flex-col items-center gap-2 h-auto py-4"
              variant="outline"
            >
              {isDownloading && downloadType === "csv" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Table className="h-6 w-6 text-green-500" />
              )}
              <span className="font-medium">CSV Data</span>
              <span className="text-xs text-muted-foreground">Spreadsheet format</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadReportDialog;
