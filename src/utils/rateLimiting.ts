const DEVICE_LIMIT = 10; // Total tests per device per month
const URL_COOLDOWN_DAYS = 30; // Days before same URL can be tested again

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
};

export const checkRateLimit = (url: string) => {
  const normalizedUrl = url.toLowerCase().trim();
  const deviceTests = getDeviceTests();
  const now = Date.now();
  const cooldownMs = URL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  
  // Check if this URL was tested recently
  const urlTest = deviceTests.tests.find(t => t.url === normalizedUrl);
  if (urlTest) {
    const timeSinceTest = now - urlTest.timestamp;
    if (timeSinceTest < cooldownMs) {
      const daysRemaining = Math.ceil((cooldownMs - timeSinceTest) / (24 * 60 * 60 * 1000));
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
    return {
      allowed: false,
      remainingTests: 0,
      previousScore: undefined,
      testId: undefined,
      daysUntilReset
    };
  }
  
  return {
    allowed: true,
    remainingTests: DEVICE_LIMIT - deviceTests.tests.length - 1,
    previousScore: undefined,
    testId: undefined
  };
};

export const recordTest = (url: string, score: number, testId: string) => {
  const normalizedUrl = url.toLowerCase().trim();
  const deviceTests = getDeviceTests();
  
  // Remove old test for this URL if exists
  deviceTests.tests = deviceTests.tests.filter(t => t.url !== normalizedUrl);
  
  // Add new test
  deviceTests.tests.push({
    url: normalizedUrl,
    score,
    testId,
    timestamp: Date.now()
  });
  
  saveDeviceTests(deviceTests);
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
