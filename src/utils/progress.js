import { findKnowledgeArticle } from '../data/knowledge';

const KEY = 'structure_quiz_practice_progress_v1';

const emptyProgress = () => ({
  attempts: 0,
  correct: 0,
  questionIds: [],
  modules: {},
  recent: [],
});

export function getPracticeProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return value && typeof value === 'object' ? { ...emptyProgress(), ...value } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function recordPracticeAnswer(question, isCorrect) {
  const progress = getPracticeProgress();
  const article = findKnowledgeArticle(question.knowledge_id, question.category);
  const moduleId = article?.id || 'unassigned';
  const moduleStats = progress.modules[moduleId] || { attempts: 0, correct: 0 };

  progress.attempts += 1;
  progress.correct += isCorrect ? 1 : 0;
  progress.questionIds = [...new Set([...progress.questionIds, question.id])];
  progress.modules[moduleId] = {
    attempts: moduleStats.attempts + 1,
    correct: moduleStats.correct + (isCorrect ? 1 : 0),
  };
  progress.recent = [
    { id: question.id, moduleId, isCorrect, answeredAt: Date.now() },
    ...progress.recent,
  ].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(progress));
}
