const TESTS_PER_PERIOD = 10; // 10 tests per period (beta phase)
const RESET_PERIOD_DAYS = 7; // 7-day rolling window from first test
const URL_COOLDOWN_DAYS = 30; // Days before same URL can be tested again
const TEST_LOCK_KEY = 'test_lock';
const TEST_LOCK_TIMEOUT = 30000; // 30 seconds lock timeout

interface TestRecord {
  url: string;
  score: number;
  testId: string;
  timestamp: number;
}

interface DeviceTests {
  tests: TestRecord[];
  count: number;
  firstTestDate: string;
}

const normalizeUrl = (url: string): string => {
  let normalized = url.toLowerCase().trim();
  // Remove leading dots
  normalized = normalized.replace(/^\.+/, '');
  // Remove protocol
  normalized = normalized.replace(/^https?:\/\//, '');
  // Remove www.
  normalized = normalized.replace(/^www\./, '');
  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');
  return normalized;
};

const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

const getDeviceTests = (): DeviceTests => {
  const stored = localStorage.getItem('foundindex_tests');
  
  if (!stored) {
    return { tests: [], count: 0, firstTestDate: '' };
  }
  
  const data: DeviceTests = JSON.parse(stored);
  const now = new Date();
  
  // Check if we need to reset based on 7-day rolling window
  if (data.firstTestDate) {
    const firstTestDate = new Date(data.firstTestDate);
    const daysSinceFirst = (now.getTime() - firstTestDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceFirst >= RESET_PERIOD_DAYS) {
      // Reset the count and first test date
      localStorage.removeItem('foundindex_tests');
      return { tests: [], count: 0, firstTestDate: '' };
    }
  }
  
  return data;
};

const saveDeviceTests = (data: DeviceTests) => {
  localStorage.setItem('foundindex_tests', JSON.stringify(data));
  // Trigger storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'foundindex_tests',
    newValue: JSON.stringify(data),
    storageArea: localStorage
  }));
};

const acquireTestLock = (): boolean => {
  const now = Date.now();
  const existingLock = localStorage.getItem(TEST_LOCK_KEY);
  
  if (existingLock) {
    const lockTime = parseInt(existingLock, 10);
    // If lock is expired, we can acquire it
    if (now - lockTime > TEST_LOCK_TIMEOUT) {
      localStorage.setItem(TEST_LOCK_KEY, now.toString());
      return true;
    }
    // Lock is still active
    return false;
  }
  
  // No lock exists, acquire it
  localStorage.setItem(TEST_LOCK_KEY, now.toString());
  return true;
};

export const releaseTestLock = () => {
  localStorage.removeItem(TEST_LOCK_KEY);
};

export const checkRateLimit = (url: string) => {
  const normalizedUrl = normalizeUrl(url);
  
  // Acquire lock to prevent concurrent checks
  if (!acquireTestLock()) {
    return {
      allowed: false,
      remainingTests: 0,
      previousScore: undefined,
      testId: undefined,
      daysUntilReset: 0,
      message: "Another test is in progress. Please wait."
    };
  }
  
  try {
    // Get fresh data from localStorage
    const deviceTests = getDeviceTests();
    const now = Date.now();
    const cooldownMs = URL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    
    // Check if this URL was tested recently
    const urlTest = deviceTests.tests.find(t => normalizeUrl(t.url) === normalizedUrl);
    if (urlTest) {
      const timeSinceTest = now - urlTest.timestamp;
      if (timeSinceTest < cooldownMs) {
        const daysRemaining = Math.ceil((cooldownMs - timeSinceTest) / (24 * 60 * 60 * 1000));
        releaseTestLock();
        return {
          allowed: false,
          remainingTests: TESTS_PER_PERIOD - deviceTests.count,
          previousScore: urlTest.score,
          testId: urlTest.testId,
          daysUntilReset: daysRemaining
        };
      }
    }
    
    // Check device limit (10 tests per 7-day period during beta)
    if (deviceTests.count >= TESTS_PER_PERIOD) {
      // Calculate days until reset based on first test date
      let daysUntilReset = 0;
      if (deviceTests.firstTestDate) {
        const firstTestDate = new Date(deviceTests.firstTestDate);
        const resetDate = new Date(firstTestDate.getTime() + (RESET_PERIOD_DAYS * 24 * 60 * 60 * 1000));
        daysUntilReset = Math.ceil((resetDate.getTime() - now) / (24 * 60 * 60 * 1000));
      }
      
      releaseTestLock();
      return {
        allowed: false,
        remainingTests: 0,
        previousScore: undefined,
        testId: undefined,
        daysUntilReset: Math.max(0, daysUntilReset)
      };
    }
    
    // Don't release lock yet - keep it until test is recorded
    return {
      allowed: true,
      remainingTests: TESTS_PER_PERIOD - deviceTests.count - 1,
      previousScore: undefined,
      testId: undefined
    };
  } catch (error) {
    releaseTestLock();
    throw error;
  }
};

export const recordTest = (url: string, score: number, testId: string) => {
  try {
    const normalizedUrl = normalizeUrl(url);
    const deviceTests = getDeviceTests();
    const now = new Date().toISOString();
    
    // Remove old test for this URL if exists
    deviceTests.tests = deviceTests.tests.filter(t => normalizeUrl(t.url) !== normalizedUrl);
    
    // Add new test
    deviceTests.tests.push({
      url: normalizedUrl,
      score,
      testId,
      timestamp: Date.now()
    });
    
    // Update count
    deviceTests.count = (deviceTests.count || 0) + 1;
    
    // Set first test date if not already set
    if (!deviceTests.firstTestDate) {
      deviceTests.firstTestDate = now;
    }
    
    saveDeviceTests(deviceTests);
  } finally {
    // Always release the lock after recording
    releaseTestLock();
  }
};

export const getRemainingTests = () => {
  const deviceTests = getDeviceTests();
  return Math.max(0, TESTS_PER_PERIOD - deviceTests.count);
};

// Deprecated - kept for backward compatibility
export const unlockTests = () => {
  // No longer needed - tests reset automatically after 7 days
  console.log("unlockTests is deprecated");
};
