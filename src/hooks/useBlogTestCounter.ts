import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const BLOG_TESTS_LIMIT = 3;

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

  const fetchFromBackend = useCallback(async () => {
    try {
      console.log("[useBlogTestCounter] Fetching from backend...");
      
      const { data, error } = await supabase.functions.invoke("get-blog-test-count");
      
      if (error) {
        console.error("[useBlogTestCounter] Backend error:", error);
        throw error;
      }

      if (data?.success) {
        const testsUsed = data.testsUsed || 0;
        const testsRemaining = data.testsRemaining ?? Math.max(0, BLOG_TESTS_LIMIT - testsUsed);
        const resetDate = data.resetDate ? new Date(data.resetDate) : null;

        console.log(`[useBlogTestCounter] Backend response - Used: ${testsUsed}, Remaining: ${testsRemaining}`);

        setState({
          testsUsed,
          testsRemaining,
          resetDate,
          loading: false,
          error: null,
        });
        return;
      }

      throw new Error("Invalid response from backend");
    } catch (e) {
      console.error("[useBlogTestCounter] Error fetching from backend:", e);
      // Fallback to localStorage if backend fails
      loadFromLocalStorage();
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    // Fallback: just show default values, don't rely on localStorage for counting
    setState({
      testsUsed: 0,
      testsRemaining: BLOG_TESTS_LIMIT,
      resetDate: null,
      loading: false,
      error: null,
    });
  }, []);

  const refresh = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));
    fetchFromBackend();
  }, [fetchFromBackend]);

  useEffect(() => {
    fetchFromBackend();

    // Listen for custom event for same-tab updates
    const handleCustomUpdate = () => {
      console.log("[useBlogTestCounter] Received update event, refreshing...");
      fetchFromBackend();
    };

    window.addEventListener("fi_blog_test_updated", handleCustomUpdate);
    
    return () => {
      window.removeEventListener("fi_blog_test_updated", handleCustomUpdate);
    };
  }, [fetchFromBackend]);

  const incrementBlogTestCount = useCallback(() => {
    // Update localStorage for immediate feedback
    const stored = localStorage.getItem("fi_blog_tests_v2");
    const data = stored ? JSON.parse(stored) : { tests: [] };
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const recentTests = (data.tests || []).filter((t: number) => t > sevenDaysAgo);
    const tests = [...recentTests, Date.now()];
    localStorage.setItem("fi_blog_tests_v2", JSON.stringify({ tests }));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("fi_blog_test_updated"));
    
    // Fetch fresh data from backend after a short delay
    setTimeout(() => {
      fetchFromBackend();
    }, 1000);
  }, [fetchFromBackend]);

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
    refresh,
  };
}
