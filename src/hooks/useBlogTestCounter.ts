import { useState, useEffect, useCallback } from "react";

const BLOG_TESTS_LIMIT = 3;
const ROLLING_WINDOW_DAYS = 7; // 7-day rolling window, not 30

interface BlogTestCounterState {
  testsRemaining: number;
  testsUsed: number;
  resetDate: Date | null;
  loading: boolean;
  error: string | null;
}

export function useBlogTestCounter() {
  const [state, setState] = useState<BlogTestCounterState>({
    testsRemaining: BLOG_TESTS_LIMIT,
    testsUsed: 0,
    resetDate: null,
    loading: true,
    error: null,
  });

  const loadBlogTestCount = useCallback(() => {
    try {
      const sevenDaysAgo = new Date(Date.now() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      
      const stored = localStorage.getItem("fi_blog_tests_v2");
      if (stored) {
        const data = JSON.parse(stored);
        // Filter to only tests within the 7-day window
        const recentTests = (data.tests || []).filter((t: number) => t > sevenDaysAgo.getTime());
        
        const testsUsed = recentTests.length;
        const testsRemaining = Math.max(0, BLOG_TESTS_LIMIT - testsUsed);
        
        // Calculate reset date based on oldest test in window
        let resetDate: Date | null = null;
        if (testsUsed >= BLOG_TESTS_LIMIT && recentTests.length > 0) {
          // Sort ascending to get the oldest test
          const sortedTests = [...recentTests].sort((a, b) => a - b);
          const oldestTest = sortedTests[0];
          resetDate = new Date(oldestTest + ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
        }
        
        // Update storage to clean up old tests
        localStorage.setItem("fi_blog_tests_v2", JSON.stringify({ tests: recentTests }));
        
        setState({
          testsUsed,
          testsRemaining,
          resetDate,
          loading: false,
          error: null,
        });
      } else {
        // Initialize
        localStorage.setItem("fi_blog_tests_v2", JSON.stringify({ tests: [] }));
        setState({
          testsUsed: 0,
          testsRemaining: BLOG_TESTS_LIMIT,
          resetDate: null,
          loading: false,
          error: null,
        });
      }
    } catch (e) {
      console.error("Error loading blog test counter:", e);
      setState((prev) => ({ ...prev, loading: false, error: "Failed to load counter" }));
    }
  }, []);

  useEffect(() => {
    loadBlogTestCount();

    // Listen for storage events (for real-time updates across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fi_blog_tests_v2") {
        loadBlogTestCount();
      }
    };

    // Also listen for custom event for same-tab updates
    const handleCustomUpdate = () => {
      loadBlogTestCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("fi_blog_test_updated", handleCustomUpdate);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("fi_blog_test_updated", handleCustomUpdate);
    };
  }, [loadBlogTestCount]);

  const incrementBlogTestCount = useCallback(() => {
    const stored = localStorage.getItem("fi_blog_tests_v2");
    const data = stored ? JSON.parse(stored) : { tests: [] };
    const sevenDaysAgo = Date.now() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    
    // Filter old tests and add new one
    const recentTests = (data.tests || []).filter((t: number) => t > sevenDaysAgo);
    const tests = [...recentTests, Date.now()];
    localStorage.setItem("fi_blog_tests_v2", JSON.stringify({ tests }));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("fi_blog_test_updated"));
    
    // Immediately update state
    loadBlogTestCount();
  }, [loadBlogTestCount]);

  const formatResetDate = useCallback(() => {
    if (!state.resetDate) return "";
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(state.resetDate) + " (IST)";
  }, [state.resetDate]);

  return {
    ...state,
    incrementBlogTestCount,
    formatResetDate,
    refresh: loadBlogTestCount,
  };
}
