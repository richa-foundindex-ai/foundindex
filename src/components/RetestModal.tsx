import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ExternalLink, RefreshCw } from "lucide-react";

interface RetestModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  url?: string;
  lastTestedDate?: Date | string;
  nextAvailableDate?: Date | string;
  cachedTestId?: string;
  cachedScore?: number;
  attemptsExhausted?: boolean;
}

/**
 * RetestModal
 *
 * Centered modal shown when a URL is in cooldown or attempts exhausted.
 * - Shows tested date and canRetest date (formatted to IST)
 * - Buttons: See previous results, Test new URL, and a link to Contact (underlined)
 */
export function RetestModal({
  open,
  onOpenChange,
  onClose,
  url,
  lastTestedDate,
  nextAvailableDate,
  cachedTestId,
  cachedScore,
  attemptsExhausted = false,
}: RetestModalProps) {
  const navigate = useNavigate();

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange?.(newOpen);
    if (!newOpen) onClose?.();
  };

  const toISO = (d?: Date | string) => {
    if (!d) return "";
    return typeof d === "string" ? d : d.toISOString();
  };

  const testedDateStr = toISO(lastTestedDate);
  const canRetestDateStr = toISO(nextAvailableDate);

  const formatDateIST = (iso?: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    return (
      new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(date) + " (IST)"
    );
  };

  const getRelativeDays = (iso?: string) => {
    if (!iso) return "";
    const now = new Date();
    const target = new Date(iso);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "now";
    if (diffDays === 1) return "in 1 day";
    return `in ${diffDays} days`;
  };

  const testedDateFormatted = formatDateIST(testedDateStr);
  const canRetestFormatted = formatDateIST(canRetestDateStr);
  const relative = getRelativeDays(canRetestDateStr);

  const handleSeeResults = () => {
    if (cachedTestId) {
      navigate(`/results?testId=${cachedTestId}&url=${encodeURIComponent(url || "")}`);
    }
    handleOpenChange(false);
  };

  const handleTestNew = () => {
    handleOpenChange(false);
    // Clear and focus the first URL-like input after modal closes
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>(
        'input[type="url"], input[type="text"], input[placeholder*="URL"]',
      );
      if (input) {
        input.value = "";
        input.focus();
      }
    }, 120);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            {attemptsExhausted ? "Test Limit Reached" : "URL Recently Tested"}
          </DialogTitle>
          <DialogDescription className="sr-only">URL cooldown information</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* URL Display */}
          {url && (
            <div className="rounded-lg bg-muted/60 px-4 py-3">
              <p className="text-sm font-medium text-foreground break-all" title={url}>
                {url}
              </p>
            </div>
          )}

          {/* Date Information */}
          <div className="space-y-3">
            {attemptsExhausted ? (
              <>
                <p className="text-sm text-muted-foreground">
                  You've tested this URL <span className="font-semibold text-foreground">3 times</span> in the last 7 days.
                </p>
                <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-3">
                  <RefreshCw className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      You can test again on:
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {canRetestFormatted || "—"}
                    </p>
                    {relative && relative !== "now" && (
                      <p className="text-xs font-medium text-primary">{relative}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  <span>Tested on </span>
                  <span className="font-semibold text-foreground">{testedDateFormatted || "—"}</span>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-3">
                  <RefreshCw className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Retest available on:
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {canRetestFormatted || "—"}
                    </p>
                    {relative && relative !== "now" && (
                      <p className="text-xs font-medium text-primary">{relative}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Previous Score */}
          {typeof cachedScore === "number" && (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Previous score</span>
                <span className="text-xl font-bold text-primary">{cachedScore}/100</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-3 pt-2 sm:flex-row">
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:justify-end">
            <Button onClick={handleSeeResults} className="w-full sm:w-auto" disabled={!cachedTestId}>
              <ExternalLink className="mr-2 h-4 w-4" />
              See previous results
            </Button>
            <Button variant="outline" onClick={handleTestNew} className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Test different URL
            </Button>
          </div>
          
          <div className="w-full text-center pt-2 border-t border-border/50">
            <Link
              to="/contact"
              onClick={() => handleOpenChange(false)}
              className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
            >
              Made changes? Reach out to us to retest
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RetestModal;
