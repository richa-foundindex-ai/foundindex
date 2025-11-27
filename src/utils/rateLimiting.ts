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
  // RATE LIMITING DISABLED (beta phase)
  // Acquire lock to prevent concurrent checks only
  if (!acquireTestLock()) {
    return {
      allowed: false,
      remainingTests: 999,
      previousScore: undefined,
      testId: undefined,
      daysUntilReset: 0,
      message: "Another test is in progress. Please wait."
    };
  }
  
  // Always allow tests during beta
  return {
    allowed: true,
    remainingTests: 999,
    previousScore: undefined,
    testId: undefined
  };
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
