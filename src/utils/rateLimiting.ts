export const checkRateLimit = (url: string) => {
  // TODO: Change back to 3 before publishing
  const WEEKLY_LIMIT = 999;
  const testsRemaining = parseInt(localStorage.getItem("testsRemaining") || String(WEEKLY_LIMIT));
  const lastResetDate = localStorage.getItem("lastResetDate");

  // Reset counter every week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (!lastResetDate || new Date(lastResetDate) < weekAgo) {
    localStorage.setItem("testsRemaining", String(WEEKLY_LIMIT));
    localStorage.setItem("lastResetDate", now.toISOString());
    return { allowed: true, remainingTests: WEEKLY_LIMIT };
  }

  // Check if this URL was tested recently
  const testedUrls = JSON.parse(localStorage.getItem("testedUrls") || "{}");
  const urlData = testedUrls[url];

  if (urlData && urlData.score !== undefined) {
    return {
      allowed: false,
      remainingTests: testsRemaining,
      previousScore: urlData.score,
      testId: urlData.testId,
    };
  }

  if (testsRemaining <= 0) {
    return { allowed: false, remainingTests: 0 };
  }

  return { allowed: true, remainingTests: testsRemaining };
};

export const recordTest = (url: string, score: number, testId: string) => {
  // TODO: Change back to 3 before publishing
  const WEEKLY_LIMIT = 999;
  const testsRemaining = parseInt(localStorage.getItem("testsRemaining") || String(WEEKLY_LIMIT));
  localStorage.setItem("testsRemaining", (testsRemaining - 1).toString());

  const testedUrls = JSON.parse(localStorage.getItem("testedUrls") || "{}");
  testedUrls[url] = { score, testedAt: Date.now(), testId };
  localStorage.setItem("testedUrls", JSON.stringify(testedUrls));
};

export const getRemainingTests = () => {
  // TODO: Change back to 3 before publishing
  const WEEKLY_LIMIT = 999;
  return parseInt(localStorage.getItem("testsRemaining") || String(WEEKLY_LIMIT));
};

// Deprecated - kept for backward compatibility
export const unlockTests = () => {
  // No longer needed - tests reset weekly automatically
  console.log("unlockTests is deprecated");
};
