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
      
      console.log("[useBlogTestCounter] Raw response:", { data, error });
      
      if (error) {
        console.error("[useBlogTestCounter] Backend error:", error);
        setState(prev => ({ ...prev, loading: false, error: "Failed to fetch count" }));
        return;
      }

      if (data?.success) {
        const testsUsed = data.testsUsed || 0;
        const testsRemaining = data.testsRemaining ?? Math.max(0, BLOG_TESTS_LIMIT - testsUsed);
        const resetDate = data.resetDate ? new Date(data.resetDate) : null;

        console.log(`[useBlogTestCounter] Backend data - Used: ${testsUsed}, Remaining: ${testsRemaining}, Reset: ${resetDate}`);

        setState({
          testsUsed,
          testsRemaining,
          resetDate,
          loading: false,
          error: null,
        });
        return;
      }

      // If success is false or missing, still use the data if available
      if (data?.testsUsed !== undefined) {
        console.log(`[useBlogTestCounter] Using data despite success flag - Used: ${data.testsUsed}`);
        setState({
          testsUsed: data.testsUsed,
          testsRemaining: data.testsRemaining ?? Math.max(0, BLOG_TESTS_LIMIT - data.testsUsed),
          resetDate: data.resetDate ? new Date(data.resetDate) : null,
          loading: false,
          error: null,
        });
        return;
      }

      console.error("[useBlogTestCounter] Invalid response from backend:", data);
      setState(prev => ({ ...prev, loading: false, error: "Invalid response" }));
    } catch (e) {
      console.error("[useBlogTestCounter] Error fetching from backend:", e);
      setState(prev => ({ ...prev, loading: false, error: "Network error" }));
    }
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
