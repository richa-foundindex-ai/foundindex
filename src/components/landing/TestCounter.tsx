import { useTestCounter } from "@/hooks/useTestCounter";

export function TestCounter() {
  const { testsRemaining, loading, formatResetDate } = useTestCounter();

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground mt-2 text-center animate-pulse">
        Loading test count...
      </p>
    );
  }

  if (testsRemaining === 0) {
    return (
      <p className="text-sm text-destructive mt-2 text-center font-medium">
        Monthly limit reached (3 tests). Resets on {formatResetDate()}
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground mt-2 text-center">
      You have <span className="font-semibold text-foreground">{testsRemaining} test{testsRemaining !== 1 ? "s" : ""}</span> remaining this month (resets {formatResetDate()})
    </p>
  );
}
