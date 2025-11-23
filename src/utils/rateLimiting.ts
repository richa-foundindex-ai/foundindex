// Cookie-based rate limiting utilities

const COOKIE_NAME = 'foundindex_tests';
const TESTS_PER_MONTH = 1;
const COOKIE_EXPIRY_DAYS = 30;

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
  // Beta testing: unlimited tests for everyone
  return { allowed: true, remainingTests: 999 };
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
