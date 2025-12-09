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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {attemptsExhausted ? "Test Limit Reached" : "URL Recently Tested"}
          </DialogTitle>
          <DialogDescription className="sr-only">URL cooldown information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {url && (
            <div className="rounded-md bg-muted/50 p-3 break-words">
              <p className="text-sm font-medium text-foreground truncate" title={url}>
                {url}
              </p>
            </div>
          )}

          {attemptsExhausted ? (
            <>
              <p className="text-sm text-muted-foreground">
                You've tested this URL <strong className="text-foreground">3 times</strong> in the last 7 days.
              </p>
              <p className="text-sm text-muted-foreground">
                You can test it again on <strong className="text-foreground">{canRetestFormatted || "—"}</strong>
                {relative && relative !== "now" && (
                  <>
                    {" "}
                    — <span className="text-primary font-medium">{relative}</span>
                  </>
                )}
                .
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                This URL was tested on <strong className="text-foreground">{testedDateFormatted || "—"}</strong>.
              </p>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 flex-shrink-0" />
                <div>
                  <div>
                    Same URL can be retested on <strong className="text-foreground">{canRetestFormatted || "—"}</strong>
                  </div>
                  {relative && relative !== "now" && <div className="text-primary font-medium mt-1">{relative}</div>}
                </div>
              </div>
            </>
          )}

          {typeof cachedScore === "number" && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm">
                Previous score: <span className="text-primary font-semibold text-lg">{cachedScore}/100</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button onClick={handleSeeResults} className="w-full sm:w-auto" disabled={!cachedTestId}>
            <ExternalLink className="mr-2 h-4 w-4" />
            See previous results
          </Button>

          <Button variant="outline" onClick={handleTestNew} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Test different URL
          </Button>

          <div className="w-full text-center mt-2 sm:mt-0 sm:ml-2">
            <Link
              to="/contact"
              onClick={() => handleOpenChange(false)}
              className="text-sm underline underline-offset-2 font-medium text-primary hover:text-primary/90"
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
