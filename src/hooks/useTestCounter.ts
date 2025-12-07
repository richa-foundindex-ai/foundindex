import { useState, useEffect, useCallback } from "react";

const TESTS_PER_MONTH = 3;

interface TestCounterState {
  testsRemaining: number;
  testsUsed: number;
  resetDate: Date;
  loading: boolean;
}

export function useTestCounter() {
  const [state, setState] = useState<TestCounterState>({
    testsRemaining: TESTS_PER_MONTH,
    testsUsed: 0,
    resetDate: getNextMonthStart(),
    loading: true,
  });

  const loadTestCount = useCallback(() => {
    try {
      const stored = localStorage.getItem("fi_test_counter");
      if (stored) {
        const data = JSON.parse(stored);
        const storedResetDate = new Date(data.resetDate);
        const now = new Date();

        // If we've passed the reset date, reset the counter
        if (now >= storedResetDate) {
          const newState = {
            testsUsed: 0,
            testsRemaining: TESTS_PER_MONTH,
            resetDate: getNextMonthStart(),
          };
          localStorage.setItem("fi_test_counter", JSON.stringify(newState));
          setState({ ...newState, loading: false });
        } else {
          setState({
            testsUsed: data.testsUsed || 0,
            testsRemaining: TESTS_PER_MONTH - (data.testsUsed || 0),
            resetDate: storedResetDate,
            loading: false,
          });
        }
      } else {
        // Initialize counter
        const newState = {
          testsUsed: 0,
          testsRemaining: TESTS_PER_MONTH,
          resetDate: getNextMonthStart(),
        };
        localStorage.setItem("fi_test_counter", JSON.stringify(newState));
        setState({ ...newState, loading: false });
      }
    } catch (e) {
      console.error("Error loading test counter:", e);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadTestCount();

    // Listen for storage events (for real-time updates across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fi_test_counter") {
        loadTestCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadTestCount]);

  const incrementTestCount = useCallback(() => {
    setState((prev) => {
      const newUsed = prev.testsUsed + 1;
      const newRemaining = Math.max(0, TESTS_PER_MONTH - newUsed);
      const newState = {
        testsUsed: newUsed,
        testsRemaining: newRemaining,
        resetDate: prev.resetDate,
      };
      localStorage.setItem("fi_test_counter", JSON.stringify(newState));
      return { ...newState, loading: false };
    });
  }, []);

  const formatResetDate = useCallback(() => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
    }).format(state.resetDate);
  }, [state.resetDate]);

  return {
    ...state,
    incrementTestCount,
    formatResetDate,
    refresh: loadTestCount,
  };
}

function getNextMonthStart(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}
