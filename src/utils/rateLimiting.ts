// Cookie-based rate limiting utilities

const COOKIE_NAME = 'foundindex_tests';
const TESTS_PER_MONTH = 3;
const COOKIE_EXPIRY_DAYS = 30;
const BYPASS_CODE = 'test123';

const isBypassActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('bypass') === BYPASS_CODE;
};

interface TestRecord {
  url: string;
  score: number;
  date: number;
}

interface CookieData {
  tests: TestRecord[];
  unlocked: boolean;
}

export const getCookieData = (): CookieData => {
  try {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`));
    
    if (!cookie) {
      return { tests: [], unlocked: false };
    }
    
    const data = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    return data;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return { tests: [], unlocked: false };
  }
};

export const setCookieData = (data: CookieData) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS);
  
  const cookieValue = encodeURIComponent(JSON.stringify(data));
  document.cookie = `${COOKIE_NAME}=${cookieValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

export const checkRateLimit = (url: string): { allowed: boolean; previousScore?: number; remainingTests: number } => {
  // Check for bypass code first
  if (isBypassActive()) {
    return { allowed: true, remainingTests: 999 };
  }
  
  const data = getCookieData();
  
  // If unlocked, allow unlimited tests
  if (data.unlocked) {
    return { allowed: true, remainingTests: 999 };
  }
  
  // Remove tests older than 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  data.tests = data.tests.filter(test => test.date > thirtyDaysAgo);
  
  // Check if this URL was already tested (case-insensitive)
  const normalizedUrl = url.toLowerCase();
  const existingTest = data.tests.find(test => test.url.toLowerCase() === normalizedUrl);
  
  if (existingTest) {
    // URL already tested - return previous score and remaining tests
    return {
      allowed: false,
      previousScore: existingTest.score,
      remainingTests: Math.max(0, TESTS_PER_MONTH - data.tests.length)
    };
  }
  
  // Check if user has remaining tests
  if (data.tests.length >= TESTS_PER_MONTH) {
    return {
      allowed: false,
      remainingTests: 0
    };
  }
  
  // Allow the test
  return {
    allowed: true,
    remainingTests: TESTS_PER_MONTH - data.tests.length - 1
  };
};

export const recordTest = (url: string, score: number) => {
  const data = getCookieData();
  
  data.tests.push({
    url,
    score,
    date: Date.now()
  });
  
  setCookieData(data);
};

export const unlockTests = () => {
  const data = getCookieData();
  data.unlocked = true;
  setCookieData(data);
};

export const getRemainingTests = (): number => {
  const data = getCookieData();
  
  if (data.unlocked) {
    return 999;
  }
  
  // Remove tests older than 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  data.tests = data.tests.filter(test => test.date > thirtyDaysAgo);
  
  return Math.max(0, TESTS_PER_MONTH - data.tests.length);
};
