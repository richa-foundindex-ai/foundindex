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

  // Format dates for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

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
                  Same URL can be retested on <strong className="text-foreground">{canRetestDateFormatted}</strong>.
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
