import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ArrowRight } from "lucide-react";

interface RetestModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  lastTestedDate: Date;
  nextAvailableDate: Date;
  cachedTestId: string;
  cachedScore: number;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
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
            <strong className="text-foreground">{url}</strong> was tested on {formatDate(lastTestedDate)}.
          </p>

          <p className="text-sm text-muted-foreground">
            Same URL can be retested on <strong className="text-foreground">{formatDate(nextAvailableDate)}</strong>.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground">
              Previous score: <span className="text-primary">{cachedScore}/100</span>
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
            Show Previous Results
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Test Different URL
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
