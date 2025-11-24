const DEVICE_LIMIT = 10; // Total tests per device per month
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
  resetDate: number;
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
  const deviceId = getDeviceId();
  const stored = localStorage.getItem(`tests_${deviceId}`);
  
  if (!stored) {
    const now = Date.now();
    const resetDate = now + (30 * 24 * 60 * 60 * 1000); // 30 days from now
    return { tests: [], resetDate };
  }
  
  const data: DeviceTests = JSON.parse(stored);
  const now = Date.now();
  
  // Reset if past reset date
  if (now > data.resetDate) {
    const newResetDate = now + (30 * 24 * 60 * 60 * 1000);
    return { tests: [], resetDate: newResetDate };
  }
  
  return data;
};

const saveDeviceTests = (data: DeviceTests) => {
  const deviceId = getDeviceId();
  localStorage.setItem(`tests_${deviceId}`, JSON.stringify(data));
  // Trigger storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: `tests_${deviceId}`,
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

const releaseTestLock = () => {
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
          remainingTests: DEVICE_LIMIT - deviceTests.tests.length,
          previousScore: urlTest.score,
          testId: urlTest.testId,
          daysUntilReset: daysRemaining
        };
      }
    }
    
    // Check device limit
    if (deviceTests.tests.length >= DEVICE_LIMIT) {
      const daysUntilReset = Math.ceil((deviceTests.resetDate - now) / (24 * 60 * 60 * 1000));
      releaseTestLock();
      return {
        allowed: false,
        remainingTests: 0,
        previousScore: undefined,
        testId: undefined,
        daysUntilReset
      };
    }
    
    // Don't release lock yet - keep it until test is recorded
    return {
      allowed: true,
      remainingTests: DEVICE_LIMIT - deviceTests.tests.length - 1,
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
    
    // Remove old test for this URL if exists
    deviceTests.tests = deviceTests.tests.filter(t => normalizeUrl(t.url) !== normalizedUrl);
    
    // Add new test
    deviceTests.tests.push({
      url: normalizedUrl,
      score,
      testId,
      timestamp: Date.now()
    });
    
    saveDeviceTests(deviceTests);
  } finally {
    // Always release the lock after recording
    releaseTestLock();
  }
};

export const getRemainingTests = () => {
  const deviceTests = getDeviceTests();
  return DEVICE_LIMIT - deviceTests.tests.length;
};

// Deprecated - kept for backward compatibility
export const unlockTests = () => {
  // No longer needed - tests reset weekly automatically
  console.log("unlockTests is deprecated");
};
