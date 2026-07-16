// 错题本 localStorage 工具

const STORAGE_KEY = 'structure_quiz_wrong_book';

// 获取所有错题 ID 集合
export function getWrongIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 添加单道错题（去重）
export function addWrongId(id) {
  const ids = getWrongIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

// 批量添加错题
export function addWrongIds(newIds) {
  const ids = getWrongIds();
  let changed = false;
  newIds.forEach((id) => {
    if (!ids.includes(id)) {
      ids.push(id);
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

// 移除单道错题（已掌握）
export function removeWrongId(id) {
  const ids = getWrongIds().filter((i) => i !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

// 清空错题本
export function clearWrongBook() {
  localStorage.removeItem(STORAGE_KEY);
}

// 检查某题是否在错题本
export function isWrongId(id) {
  return getWrongIds().includes(id);
}

// 获取错题数量
export function getWrongCount() {
  return getWrongIds().length;
}
