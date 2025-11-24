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

  // Check if this URL was tested recently
  const testedUrls = JSON.parse(localStorage.getItem("testedUrls") || "{}");
  const urlData = testedUrls[url];

  if (urlData && urlData.score !== undefined) {
    return {
      allowed: false,
      remainingTests: testsRemaining,
      previousScore: urlData.score,
    };
  }

  if (testsRemaining <= 0) {
    return { allowed: false, remainingTests: 0 };
  }

  return { allowed: true, remainingTests: testsRemaining };
};

export const recordTest = (url: string, score: number) => {
  const testsRemaining = parseInt(localStorage.getItem("testsRemaining") || "3");
  localStorage.setItem("testsRemaining", (testsRemaining - 1).toString());

  const testedUrls = JSON.parse(localStorage.getItem("testedUrls") || "{}");
  testedUrls[url] = { score, testedAt: Date.now() };
  localStorage.setItem("testedUrls", JSON.stringify(testedUrls));
};

export const getRemainingTests = () => {
  return parseInt(localStorage.getItem("testsRemaining") || "3");
};

// Deprecated - kept for backward compatibility
export const unlockTests = () => {
  // No longer needed - tests reset weekly automatically
  console.log("unlockTests is deprecated");
};
