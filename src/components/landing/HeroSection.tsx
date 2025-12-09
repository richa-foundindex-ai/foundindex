import { RetestModal } from "@/components/RetestModal";
import { useToast } from "@/hooks/use-toast";

// Add state for modal
const [retestModal, setRetestModal] = useState<{
  open: boolean;
  testedDate?: string;
  canRetestDate?: string;
  cachedTestId?: string;
  cachedScore?: number;
  attemptsExhausted?: boolean;
}>({
  open: false,
});

const { toast, dismiss } = useToast();

// Add to input field
<input
  onFocus={() => {
    // Dismiss all toasts when user focuses input
    dismiss();
  }}
  onChange={() => {
    // Dismiss all toasts when user types
    dismiss();
  }}
  // ... rest of input props
/>;

// Update form submit handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Dismiss all existing toasts before starting new analysis
  dismiss();

  // ... existing submit logic

  // When handling API response:
  if (!response.success) {
    if (response.error_type === "RATE_LIMIT_URL") {
      // Show modal instead of toast
      setRetestModal({
        open: true,
        testedDate: response.cached_created_at,
        canRetestDate: response.next_available_time,
        cachedTestId: response.cached_test_id,
        cachedScore: response.cached_score,
        attemptsExhausted: response.suggested_action?.includes("3 times") || false,
      });
      return;
    }

    // Other errors use toasts with user-friendly messages
    if (response.error_type === "RATE_LIMIT_IP") {
      toast({
        title: "Daily limit reached",
        description:
          "You've used all your free tests for today (10 per day). Try again tomorrow or use a different internet connection (mobile data).",
        variant: "destructive",
        duration: Infinity,
      });
      return;
    }

    // Default error
    toast({
      title: "Something went wrong",
      description: "We couldn't analyze this URL right now. Please try again in a few minutes.",
      variant: "destructive",
      duration: Infinity,
    });
    return;
  }

  // Success handling...
};

// Add modal to component return
return (
  <div>
    {/* existing JSX */}

    <RetestModal
      open={retestModal.open}
      onOpenChange={(open) => setRetestModal({ ...retestModal, open })}
      testedDate={retestModal.testedDate || ""}
      canRetestDate={retestModal.canRetestDate || ""}
      cachedTestId={retestModal.cachedTestId}
      cachedScore={retestModal.cachedScore}
      attemptsExhausted={retestModal.attemptsExhausted}
    />
  </div>
);
