import { useBlogTestCounter } from "@/hooks/useBlogTestCounter";

export function BlogTestCounter() {
  const { testsRemaining, loading, formatResetDate, resetDate } = useBlogTestCounter();

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground mt-2 text-center animate-pulse">
        Loading...
      </p>
    );
  }

  if (testsRemaining === 0 && resetDate) {
    return (
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Blog posts: <span className="font-semibold text-destructive">0/3</span> tests remaining 
        <span className="text-muted-foreground"> (resets {formatResetDate()})</span>
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground mt-2 text-center">
      Blog posts: <span className="font-semibold text-foreground">{testsRemaining}/3</span> tests remaining
    </p>
  );
}
