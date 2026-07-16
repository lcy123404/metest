// 未登录用户使用次数限制

const STORAGE_KEY = 'guest_usage';
const DAILY_LIMITS = { learn: 2, exam: 1 };

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function loadUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : { date: getToday(), learn: 0, exam: 0 };
    if (data.date !== getToday()) {
      return { date: getToday(), learn: 0, exam: 0 };
    }
    return data;
  } catch { return { date: getToday(), learn: 0, exam: 0 }; }
}

function saveUsage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function canUseLearn() {
  const usage = loadUsage();
  return usage.learn < DAILY_LIMITS.learn;
}

export function canUseExam() {
  const usage = loadUsage();
  return usage.exam < DAILY_LIMITS.exam;
}

export function recordLearnUse() {
  const usage = loadUsage();
  usage.learn += 1;
  saveUsage(usage);
}

export function recordExamUse() {
  const usage = loadUsage();
  usage.exam += 1;
  saveUsage(usage);
}

export function getRemainingLearn() {
  return Math.max(0, DAILY_LIMITS.learn - loadUsage().learn);
}

export function getRemainingExam() {
  return Math.max(0, DAILY_LIMITS.exam - loadUsage().exam);
}
