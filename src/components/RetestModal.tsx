import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, RefreshCw } from "lucide-react";

interface RetestModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  url?: string;
  lastTestedDate?: Date;
  nextAvailableDate?: Date;
  testedDate?: string;
  canRetestDate?: string;
  cachedTestId?: string;
  cachedScore?: number;
  attemptsExhausted?: boolean;
}

export function RetestModal({
  open,
  onOpenChange,
  onClose,
  url,
  lastTestedDate,
  nextAvailableDate,
  testedDate,
  canRetestDate,
  cachedTestId,
  cachedScore,
  attemptsExhausted = false,
}: RetestModalProps) {
  const navigate = useNavigate();

  // Support both prop patterns
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!newOpen && onClose) onClose();
  };

  // Use either Date objects or ISO strings
  const testedDateStr = testedDate || (lastTestedDate ? lastTestedDate.toISOString() : "");
  const canRetestDateStr = canRetestDate || (nextAvailableDate ? nextAvailableDate.toISOString() : "");

  // Format dates for display in IST
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return (
      new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(date) + " (IST)"
    );
  };

  // Calculate relative days
  const getRelativeDays = (dateStr: string): string => {
    if (!dateStr) return "";
    const now = new Date();
    const target = new Date(dateStr);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "now";
    if (diffDays === 1) return "in 1 day";
    return `in ${diffDays} days`;
  };

  const testedDateFormatted = formatDate(testedDateStr);
  const canRetestDateFormatted = formatDate(canRetestDateStr);
  const relativeDays = getRelativeDays(canRetestDateStr);

  const handleSeeResults = () => {
    if (cachedTestId) {
      navigate(`/results?testId=${cachedTestId}&url=${encodeURIComponent(url || "")}`);
    }
    handleOpenChange(false);
  };

  const handleTestNewUrl = () => {
    handleOpenChange(false);
    // Focus on URL input after modal closes
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[type="text"], input[placeholder*="URL"]');
      if (input) {
        input.value = "";
        input.focus();
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            {attemptsExhausted ? "Test Limit Reached" : "URL Recently Tested"}
          </DialogTitle>
          <DialogDescription className="sr-only">URL cooldown information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {url && (
            <p className="text-sm text-muted-foreground break-all">
              <strong className="text-foreground">{url}</strong>
            </p>
          )}

          {attemptsExhausted ? (
            <>
              <p className="text-sm text-muted-foreground">
                You've tested this URL <strong className="text-foreground">3 times</strong> in the last 7 days.
              </p>
              <p className="text-sm text-muted-foreground">
                You can test it again on <strong className="text-foreground">{canRetestDateFormatted}</strong>, or test
                a different URL now.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                This URL was tested on <strong className="text-foreground">{testedDateFormatted}</strong>.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>
                  Same URL can be retested on <strong className="text-foreground">{canRetestDateFormatted}</strong>
                  {relativeDays && relativeDays !== "now" && (
                    <>
                      {" "}
                      — <span className="text-primary font-medium">{relativeDays}</span>
                    </>
                  )}
                </span>
              </div>
            </>
          )}

          {cachedScore !== undefined && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground">
                Previous score: <span className="text-primary text-lg">{cachedScore}/100</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={handleSeeResults} className="w-full sm:w-auto" disabled={!cachedTestId}>
            See old results
          </Button>
          <Button variant="outline" onClick={handleTestNewUrl} className="w-full sm:w-auto">
            Test new URL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
