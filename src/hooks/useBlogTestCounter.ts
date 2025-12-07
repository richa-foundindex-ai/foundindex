import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const BLOG_TESTS_LIMIT = 3;
const ROLLING_WINDOW_DAYS = 30;

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

  const loadBlogTestCount = useCallback(async () => {
    try {
      // Get tests from local storage as fallback tracking
      const thirtyDaysAgo = new Date(Date.now() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      
      const stored = localStorage.getItem("fi_blog_tests_v2");
      if (stored) {
        const data = JSON.parse(stored);
        const recentTests = (data.tests || []).filter((t: number) => t > thirtyDaysAgo.getTime());
        
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

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadBlogTestCount]);

  const incrementBlogTestCount = useCallback(() => {
    const stored = localStorage.getItem("fi_blog_tests_v2");
    const data = stored ? JSON.parse(stored) : { tests: [] };
    const tests = [...(data.tests || []), Date.now()];
    localStorage.setItem("fi_blog_tests_v2", JSON.stringify({ tests }));
    
    // Reload to update state
    loadBlogTestCount();
  }, [loadBlogTestCount]);

  const formatResetDate = useCallback(() => {
    if (!state.resetDate) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
    }).format(state.resetDate);
  }, [state.resetDate]);

  return {
    ...state,
    incrementBlogTestCount,
    formatResetDate,
    refresh: loadBlogTestCount,
  };
}
