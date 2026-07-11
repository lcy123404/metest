import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import questions from '../data/questions';
import { addWrongId } from '../utils/storage';
import KnowledgePanel from '../components/KnowledgePanel';

// 洗牌函数
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LearnMode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categories = ['全部', ...new Set(questions.map((q) => q.category))];
  const countOptions = [10, 20, 30, 40, 0]; // 0 = 全部

  // 状态
  const [filter, setFilter] = useState('全部');
  const [questionCount, setQuestionCount] = useState(20);
  const [shuffled, setShuffled] = useState(false); // 是否随机
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // 错题本模式
  const fromWrong = searchParams.get('from') === 'wrong';

  // 筛选题目
  const baseQuestions = useMemo(() => {
    let pool = questions;
    if (fromWrong) {
      // 从错题本进入：筛选错题
      const { getWrongIds } = require('../utils/storage');
      const wrongIds = getWrongIds();
      pool = questions.filter((q) => wrongIds.includes(q.id));
    } else if (filter !== '全部') {
      pool = questions.filter((q) => q.category === filter);
    }
    return pool;
  }, [filter, fromWrong]);

  // 实际刷的题目（随机+限制数量）
  const quizQuestions = useMemo(() => {
    if (!started) return [];
    let pool = baseQuestions;
    if (shuffled) pool = shuffle(pool);
    const limit = questionCount === 0 ? pool.length : Math.min(questionCount, pool.length);
    return pool.slice(0, limit);
  }, [started, baseQuestions, shuffled, questionCount]);

  const totalQuestions = quizQuestions.length;
  const currentQuestion = quizQuestions[currentIndex];
  const progress = totalQuestions > 0 ? ((currentIndex + (showResult ? 1 : 0)) / totalQuestions) * 100 : 0;

  // 判断答案是否正确
  const checkCorrect = (q, ans) => {
    if (q.type === 'multiple') {
      return JSON.stringify([...q.answer].sort()) === JSON.stringify([...(ans || [])].sort());
    }
    return ans === q.answer;
  };

  const handleSelectAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = checkCorrect(currentQuestion, index);
    if (!isCorrect) addWrongId(currentQuestion.id);

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleMultiSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer((prev) => {
      const arr = prev || [];
      if (arr.includes(index)) return arr.filter((i) => i !== index);
      return [...arr, index];
    });
  };

  const handleMultiConfirm = () => {
    if (!selectedAnswer || selectedAnswer.length === 0) return;
    setShowResult(true);

    const isCorrect = checkCorrect(currentQuestion, selectedAnswer);
    if (!isCorrect) addWrongId(currentQuestion.id);

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleStart = () => setStarted(true);

  const handleOpenReference = (url) => {
    window.open(url, '_blank', 'noopener');
  };

  const isAnswerCorrect = (optionIndex) => {
    if (!showResult || !currentQuestion) return null;
    if (currentQuestion.type === 'multiple') {
      if (currentQuestion.answer.includes(optionIndex)) return 'correct';
      if (selectedAnswer?.includes(optionIndex) && !currentQuestion.answer.includes(optionIndex))
        return 'wrong';
      return null;
    }
    if (optionIndex === currentQuestion.answer) return 'correct';
    if (optionIndex === selectedAnswer && optionIndex !== currentQuestion.answer) return 'wrong';
    return null;
  };

  const getOptionClass = (index) => {
    const status = isAnswerCorrect(index);
    const base = 'option-item';
    if (!showResult) {
      if (currentQuestion?.type === 'multiple' && selectedAnswer?.includes(index))
        return `${base} selected`;
      if (currentQuestion?.type !== 'multiple' && selectedAnswer === index)
        return `${base} selected`;
      return base;
    }
    if (status === 'correct') return `${base} correct`;
    if (status === 'wrong') return `${base} wrong`;
    return `${base} dimmed`;
  };

  // 开始前的配置界面
  if (!started) {
    return (
      <div className="learn-page">
        <button className="btn btn-back" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
        <div className="setup-card">
          <h2>📖 {fromWrong ? '错题复习' : '学习模式'}设置</h2>

          {!fromWrong && (
            <div className="setup-section">
              <label className="setup-label">题目分类</label>
              <div className="category-filter">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`filter-btn ${filter === cat ? 'active' : ''}`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="setup-hint">当前分类共 {baseQuestions.length} 道题</p>
            </div>
          )}

          <div className="setup-section">
            <label className="setup-label">刷题数量</label>
            <div className="count-selector">
              {countOptions.map((n) => (
                <button
                  key={n}
                  className={`count-btn ${questionCount === n ? 'active' : ''}`}
                  onClick={() => setQuestionCount(n)}
                >
                  {n === 0 ? `全部(${baseQuestions.length}题)` : `${n}题`}
                </button>
              ))}
            </div>
          </div>

          <div className="setup-section">
            <label className="setup-label">出题方式</label>
            <div className="toggle-row">
              <button
                className={`toggle-btn ${!shuffled ? 'active' : ''}`}
                onClick={() => setShuffled(false)}
              >
                按顺序
              </button>
              <button
                className={`toggle-btn ${shuffled ? 'active' : ''}`}
                onClick={() => setShuffled(true)}
              >
                随机打乱
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={handleStart}
            disabled={baseQuestions.length === 0}
          >
            {baseQuestions.length === 0 ? '暂无题目' : '开始学习'}
          </button>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="learn-page">
        <div className="empty-state">
          <p>该分类暂无题目</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-page">
      {/* 顶部导航 */}
      <div className="learn-header">
        <button className="btn btn-back" onClick={() => setShowExitConfirm(true)}>
          ← 退出学习
        </button>
        <div className="score-display">
          正确率：{score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
          （{score.correct}/{score.total}）
        </div>
      </div>

      {/* 退出确认 */}
      {showExitConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>确定要退出当前学习吗？<br />已答进度不会保存。</p>
            <div className="confirm-actions">
              <button className="btn btn-outline" onClick={() => setShowExitConfirm(false)}>
                继续学习
              </button>
              <button className="btn btn-danger" onClick={() => navigate('/')}>
                确定退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 进度条 */}
      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {currentQuestion && (
        <div className="question-card">
          {/* 题目标签 */}
          <div className="question-meta">
            <span className={`difficulty-tag ${currentQuestion.difficulty}`}>
              {currentQuestion.difficulty === 'easy' ? '简单' : currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
            </span>
            <span className="category-tag">{currentQuestion.category}</span>
            <span className="type-tag">
              {currentQuestion.type === 'single' ? '单选题' : currentQuestion.type === 'multiple' ? '多选题' : '判断题'}
            </span>
          </div>

          {/* 题目 */}
          <h3 className="question-text">{currentQuestion.question}</h3>

          {/* 选项 */}
          <div className="options-list">
            {currentQuestion.type === 'judge' ? (
              <>
                <button
                  className={getOptionClass(0)}
                  onClick={() => handleSelectAnswer(0)}
                  disabled={showResult}
                >
                  <span className="option-label">A</span>
                  <span className="option-text">正确 ✓</span>
                </button>
                <button
                  className={getOptionClass(1)}
                  onClick={() => handleSelectAnswer(1)}
                  disabled={showResult}
                >
                  <span className="option-label">B</span>
                  <span className="option-text">错误 ✗</span>
                </button>
              </>
            ) : (
              currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  className={getOptionClass(i)}
                  onClick={() =>
                    currentQuestion.type === 'multiple' ? handleMultiSelect(i) : handleSelectAnswer(i)
                  }
                  disabled={showResult && currentQuestion.type === 'single'}
                >
                  <span className="option-label">{String.fromCharCode(65 + i)}</span>
                  <span className="option-text">{opt}</span>
                </button>
              ))
            )}
          </div>

          {/* 多选题确认按钮 */}
          {currentQuestion.type === 'multiple' && !showResult && (
            <button
              className="btn btn-confirm"
              onClick={handleMultiConfirm}
              disabled={!selectedAnswer || selectedAnswer.length === 0}
            >
              确认选择
            </button>
          )}

          {/* 答案反馈 & 解析 */}
          {showResult && (
            <div className={`feedback ${
              checkCorrect(currentQuestion, currentQuestion.type === 'multiple' ? selectedAnswer : selectedAnswer)
                ? 'feedback-correct' : 'feedback-wrong'
            }`}>
              <div className="feedback-header">
                {checkCorrect(currentQuestion, currentQuestion.type === 'multiple' ? selectedAnswer : selectedAnswer) ? (
                  <span className="feedback-icon">🎉 回答正确！</span>
                ) : (
                  <span className="feedback-icon">❌ 回答错误（已加入错题本）</span>
                )}
              </div>
              <div className="feedback-correct-answer">
                <strong>正确答案：</strong>
                {currentQuestion.type === 'multiple'
                  ? currentQuestion.answer.map((i) => String.fromCharCode(65 + i)).join('、')
                  : currentQuestion.type === 'judge'
                    ? (currentQuestion.answer === 0 ? '正确 ✓' : '错误 ✗')
                    : String.fromCharCode(65 + currentQuestion.answer) + '. ' + currentQuestion.options[currentQuestion.answer]}
              </div>
              <div className="feedback-explanation">
                <strong>解析：</strong>
                {currentQuestion.explanation}
              </div>
              <div className="feedback-reference">
                <a
                  className="reference-link"
                  href={currentQuestion.reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { e.preventDefault(); handleOpenReference(currentQuestion.reference_url); }}
                >
                  📚 {currentQuestion.reference} →
                </a>
              </div>

              {/* 知识文章深入展开 */}
              {currentQuestion.knowledge_id && (
                <KnowledgePanel knowledgeId={currentQuestion.knowledge_id} />
              )}
            </div>
          )}

          {/* 导航按钮 */}
          <div className="question-nav">
            <button
              className="btn btn-outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ← 上一题
            </button>
            {currentIndex < totalQuestions - 1 ? (
              <button className="btn btn-primary" onClick={handleNext}>
                下一题 →
              </button>
            ) : showResult ? (
              <div className="complete-msg">
                ✅ 全部完成！正确率 {Math.round((score.correct / score.total) * 100)}%
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
