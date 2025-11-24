export const checkRateLimit = (url: string) => {
  const testsRemaining = parseInt(localStorage.getItem("testsRemaining") || "3");
  const lastResetDate = localStorage.getItem("lastResetDate");

  // Reset counter every week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (!lastResetDate || new Date(lastResetDate) < weekAgo) {
    localStorage.setItem("testsRemaining", "3");
    localStorage.setItem("lastResetDate", now.toISOString());
    return { allowed: true, remainingTests: 3 };
  }

  if (testsRemaining <= 0) {
    return { allowed: false, remainingTests: 0 };
  }

  return { allowed: true, remainingTests: testsRemaining };
};

export const recordTest = (url: string, score: number) => {
  const testsRemaining = parseInt(localStorage.getItem("testsRemaining") || "3");
  localStorage.setItem("testsRemaining", (testsRemaining - 1).toString());
};

export const getRemainingTests = () => {
  return parseInt(localStorage.getItem("testsRemaining") || "3");
};
