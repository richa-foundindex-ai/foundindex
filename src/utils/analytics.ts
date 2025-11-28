// Simple analytics event tracking
// In production, connect this to Google Analytics or your preferred service

type EventCategory = 'page_view' | 'button_click' | 'form_submission' | 'test_completion' | 'error';

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
}

export const trackEvent = ({ category, action, label, value }: AnalyticsEvent) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', { category, action, label, value });
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Send to custom analytics endpoint if needed
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ category, action, label, value }) });
};

// Convenience functions for common events
export const analytics = {
  pageView: (pageName: string) => {
    trackEvent({
      category: 'page_view',
      action: 'view',
      label: pageName,
    });
  },

  buttonClick: (buttonName: string, location?: string) => {
    trackEvent({
      category: 'button_click',
      action: 'click',
      label: location ? `${buttonName} - ${location}` : buttonName,
    });
  },

  formSubmit: (formName: string) => {
    trackEvent({
      category: 'form_submission',
      action: 'submit',
      label: formName,
    });
  },

  testComplete: (score: number, testType: string) => {
    trackEvent({
      category: 'test_completion',
      action: 'complete',
      label: testType,
      value: score,
    });
  },

  error: (errorType: string, errorMessage?: string) => {
    trackEvent({
      category: 'error',
      action: errorType,
      label: errorMessage,
    });
  },
};
