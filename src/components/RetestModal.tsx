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

interface RetestModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  url?: string;
  lastTestedDate?: Date;
  nextAvailableDate?: Date;
  testedDate?: string; // ISO date string
  canRetestDate?: string; // ISO date string
  cachedTestId?: string;
  cachedScore?: number;
  attemptsExhausted?: boolean; // true if 3 attempts used
}

export function RetestModal({
  open,
  onOpenChange,
  onClose,
  lastTestedDate,
  nextAvailableDate,
  testedDate,
  canRetestDate,
  cachedTestId,
  cachedScore,
  attemptsExhausted = false,
}: RetestModalProps) {
  // Support both prop patterns
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!newOpen && onClose) onClose();
  };
  
  // Use either Date objects or ISO strings
  const testedDateStr = testedDate || (lastTestedDate ? lastTestedDate.toISOString() : "");
  const canRetestDateStr = canRetestDate || (nextAvailableDate ? nextAvailableDate.toISOString() : "");
  const navigate = useNavigate();

  // Format dates for display in IST timezone
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const formatted = new Intl.DateTimeFormat("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date);
    return `${formatted} (IST)`;
  };
  
  // Calculate relative days remaining
  const getDaysRemaining = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  
  const daysRemaining = canRetestDateStr ? getDaysRemaining(canRetestDateStr) : 0;

  const testedDateFormatted = testedDateStr ? formatDate(testedDateStr) : "";
  const canRetestDateFormatted = canRetestDateStr ? formatDate(canRetestDateStr) : "";

  const handleSeeResults = () => {
    if (cachedTestId) {
      navigate(`/results/${cachedTestId}`);
    }
    handleOpenChange(false);
  };

  const handleTestNewUrl = () => {
    handleOpenChange(false);
    // Focus on URL input after modal closes
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[type="url"], input[placeholder*="URL"]');
      if (input) {
        input.value = "";
        input.focus();
      }
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{attemptsExhausted ? "Test Limit Reached" : "URL Recently Tested"}</DialogTitle>
          <DialogDescription className="pt-4 space-y-2">
            {attemptsExhausted ? (
              <>
                <p>
                  You've tested this URL <strong>3 times</strong> in the last 7 days.
                </p>
                <p>
                  You can test it again on <strong className="text-foreground">{canRetestDateFormatted}</strong>, or
                  test a different URL now.
                </p>
              </>
            ) : (
              <>
                <p>
                  This URL was tested on <strong className="text-foreground">{testedDateFormatted}</strong>.
                </p>
                <p>
                  Same URL can be retested on <strong className="text-foreground">{canRetestDateFormatted}</strong>
                  {daysRemaining > 0 && <span className="text-muted-foreground"> — in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>}.
                </p>
              </>
            )}
            {cachedScore && (
              <p className="text-sm text-muted-foreground pt-2">
                Previous score: <strong>{cachedScore}/100</strong>
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={handleTestNewUrl} variant="outline" className="w-full sm:w-auto">
            Test new URL
          </Button>
          <Button onClick={handleSeeResults} className="w-full sm:w-auto" disabled={!cachedTestId}>
            See old results
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
