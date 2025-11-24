export const checkRateLimit = (url: string) => {
  // TODO: Change back to 3 before publishing - CURRENTLY DISABLED FOR TESTING
  return { allowed: true, remainingTests: 999, previousScore: undefined, testId: undefined };
};

export const recordTest = (url: string, score: number, testId: string) => {
  // TODO: Change back to 3 before publishing - CURRENTLY DISABLED FOR TESTING
  // Do nothing during testing phase
};

export const getRemainingTests = () => {
  // TODO: Change back to 3 before publishing - CURRENTLY DISABLED FOR TESTING
  return 999;
};

// Deprecated - kept for backward compatibility
export const unlockTests = () => {
  // No longer needed - tests reset weekly automatically
  console.log("unlockTests is deprecated");
};
