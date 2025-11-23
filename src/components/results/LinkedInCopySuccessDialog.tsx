import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface LinkedInCopySuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkedInCopySuccessDialog = ({ open, onOpenChange }: LinkedInCopySuccessDialogProps) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="rounded-full bg-emerald-500/10 p-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              LinkedIn post copied!
            </h3>
            <p className="text-base text-emerald-700 dark:text-emerald-300">
              Paste it on LinkedIn and share your score
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
