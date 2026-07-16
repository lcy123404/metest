// 收藏 & 笔记管理（localStorage）
const FAV_KEY = 'favorites';
const NOTE_KEY = 'notes';

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// 收藏
export function getFavorites() {
  return loadJson(FAV_KEY, []);
}

export function isFavorite(qId) {
  return getFavorites().includes(qId);
}

export function toggleFavorite(qId) {
  const favs = getFavorites();
  const idx = favs.indexOf(qId);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(qId);
  saveJson(FAV_KEY, favs);
  return !getFavorites().includes(qId); // 返回是否已收藏
}

// 笔记
export function getNotes() {
  return loadJson(NOTE_KEY, {});
}

export function getNote(qId) {
  return getNotes()[qId] || '';
}

export function setNote(qId, text) {
  const notes = getNotes();
  if (text.trim()) notes[qId] = text.trim();
  else delete notes[qId];
  saveJson(NOTE_KEY, notes);
}

// 收藏数量
export function getFavCount() {
  return getFavorites().length;
}

// 按类型筛选（用于真题专区等）
export function getFavoriteQuestions(questions) {
  const favs = getFavorites();
  return questions.filter(q => favs.includes(q.id));
}
