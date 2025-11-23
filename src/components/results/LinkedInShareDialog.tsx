import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkedInShareDialog = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold text-center">
            ✅ LinkedIn post copied!
          </h2>
          <p className="text-center text-muted-foreground text-lg">
            Open LinkedIn and paste your post (Cmd+V or Ctrl+V)
          </p>
          <p className="text-xs text-muted-foreground text-center">
            This dialog will close automatically in 10 seconds
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
