import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ArrowRight, Clock } from "lucide-react";

interface RetestModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  lastTestedDate: Date;
  nextAvailableDate: Date;
  cachedTestId: string;
  cachedScore: number;
}

// Format date in IST timezone
const formatDateIST = (date: Date) => {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

// Calculate relative days until date
const getRelativeDays = (targetDate: Date): string => {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return "now";
  if (diffDays === 1) return "in 1 day";
  return `in ${diffDays} days`;
};

export const RetestModal = ({
  open,
  onClose,
  url,
  lastTestedDate,
  nextAvailableDate,
  cachedTestId,
  cachedScore,
}: RetestModalProps) => {
  const navigate = useNavigate();
  const relativeDays = getRelativeDays(nextAvailableDate);
  const canRetestNow = relativeDays === "now";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            This URL Was Recently Tested
          </DialogTitle>
          <DialogDescription className="sr-only">
            URL cooldown information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground break-all">
            <strong className="text-foreground">{url}</strong> was tested on {formatDateIST(lastTestedDate)} (IST).
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            {canRetestNow ? (
              <span className="text-green-600 font-medium">Ready to retest now!</span>
            ) : (
              <span>
                Same URL can be retested on <strong className="text-foreground">{formatDateIST(nextAvailableDate)}</strong> (IST) — <span className="text-primary font-medium">{relativeDays}</span>
              </span>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground">
              Previous score: <span className="text-primary text-lg">{cachedScore}/100</span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={() => {
              navigate(`/results?testId=${cachedTestId}&url=${encodeURIComponent(url)}`);
              onClose();
            }}
            className="w-full sm:w-auto"
          >
            See Old Results
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Test New URL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};