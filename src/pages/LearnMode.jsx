import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bookmark, Check, FilePenLine, LibraryBig } from 'lucide-react';
import questions from '../data/questions';
import { addWrongId, getWrongIds } from '../utils/storage';
import { canUseLearn, recordLearnUse, getRemainingLearn } from '../utils/guestLimit';
import { isFavorite, toggleFavorite, getNote, setNote } from '../utils/favorites';
import { useAuth } from '../contexts/AuthContext';
import KnowledgePanel from '../components/KnowledgePanel';
import { getLevel1Category } from '../utils/categories';
import { recordPracticeAnswer } from '../utils/progress';

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
  const { user } = useAuth();

  const practicePacks = [
    {
      id: 'all',
      name: '全部题库',
      desc: '不限制范围，适合完整拉练',
      match: () => true,
    },
    {
      id: 'foundation',
      name: '基础入门',
      desc: '塑胶结构、机械基础、材料性能',
      match: (q) => ['plastic-mold', 'mech-basics', 'material-surface'].includes(getLevel1Category(q.category)),
    },
    {
      id: 'process',
      name: '工艺专项',
      desc: '钣金、压铸、型材、CNC 与表面处理',
      match: (q) => ['sheetmetal-diecast', 'material-surface'].includes(getLevel1Category(q.category)),
    },
    {
      id: 'dfm',
      name: '流程 DFM',
      desc: 'NPI、DFM、试模、量产与工程文档',
      match: (q) => getLevel1Category(q.category) === 'npi-process',
    },
    {
      id: 'advanced',
      name: '进阶冲刺',
      desc: '公差、热设计、可靠性、DFMEA 等',
      match: (q) => ['advanced-tech', 'industry-specific'].includes(getLevel1Category(q.category)) || q.category.includes('公差'),
    },
    {
      id: 'hard',
      name: '困难题',
      desc: '只练 hard 难度，适合面试前压测',
      match: (q) => q.difficulty === 'hard',
    },
  ];
  const countOptions = [10, 30, 60, 100, 0]; // 0 = 全部

  // 状态
  const initialPack = searchParams.get('pack') || 'all';
  const initialCount = Number(searchParams.get('count')) || 30;
  const requestedIds = useMemo(
    () => (searchParams.get('ids') || '').split(',').map(Number).filter(Number.isFinite),
    [searchParams]
  );
  const [filter, setFilter] = useState(initialPack);
  const [questionCount, setQuestionCount] = useState([10, 30, 60, 100, 0].includes(initialCount) ? initialCount : 30);
  const [shuffled, setShuffled] = useState(searchParams.get('shuffle') === '1'); // 是否随机
  const [started, setStarted] = useState(searchParams.get('autostart') === '1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [, setFavKey] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [comboPopup, setComboPopup] = useState(''); // '', 'correct', 'great', 'perfect'

  // 错题本模式
  const fromWrong = searchParams.get('from') === 'wrong';

  // 筛选题目
  const baseQuestions = useMemo(() => {
    let pool = questions;
    if (requestedIds.length > 0) {
      const byId = new Map(questions.map((question) => [question.id, question]));
      pool = requestedIds.map((id) => byId.get(id)).filter(Boolean);
    } else if (fromWrong) {
      // 从错题本进入：筛选错题
      const wrongIds = getWrongIds();
      pool = questions.filter((q) => wrongIds.includes(q.id));
    } else {
      const pack = practicePacks.find((item) => item.id === filter) || practicePacks[0];
      pool = questions.filter(pack.match);
    }
    return pool;
  }, [filter, fromWrong, requestedIds]);

  // 实际刷的题目（随机+限制数量）
  const quizQuestions = useMemo(() => {
    if (!started) return [];
    let pool = baseQuestions;
    if (shuffled && requestedIds.length === 0) pool = shuffle(pool);
    const limit = questionCount === 0 ? pool.length : Math.min(questionCount, pool.length);
    return pool.slice(0, limit);
  }, [started, baseQuestions, shuffled, questionCount, requestedIds]);

  const totalQuestions = quizQuestions.length;
  const currentQuestion = quizQuestions[currentIndex];
  const progress = totalQuestions > 0 ? ((currentIndex + (showResult ? 1 : 0)) / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (!started || !currentQuestion) return;
    localStorage.setItem('structure_quiz_last_session', JSON.stringify({
      pack: filter,
      count: questionCount,
      currentQuestionId: currentQuestion.id,
      updatedAt: Date.now(),
    }));
  }, [started, currentQuestion, filter, questionCount]);

  useEffect(() => {
    if (!currentQuestion) return;
    setNoteDraft(getNote(currentQuestion.id));
    setNoteOpen(false);
  }, [currentQuestion]);

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
    recordPracticeAnswer(currentQuestion, isCorrect);

    // 连击
    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setComboPopup(newCombo >= 10 ? 'perfect' : newCombo >= 5 ? 'great' : 'correct');
      setTimeout(() => setComboPopup(''), 1200);
    } else {
      setCombo(0);
    }

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
    recordPracticeAnswer(currentQuestion, isCorrect);

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setComboPopup(newCombo >= 10 ? 'perfect' : newCombo >= 5 ? 'great' : 'correct');
      setTimeout(() => setComboPopup(''), 1200);
    } else {
      setCombo(0);
    }

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

  const handleStart = () => {
    if (!user && !canUseLearn()) {
      setShowLoginPrompt(true);
      return;
    }
    if (!user) recordLearnUse();
    setCombo(0);
    setMaxCombo(0);
    setStarted(true);
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
        <div className="setup-card learn-setup-redesign">
          <div className="setup-hero">
            <span className="setup-kicker">{fromWrong ? 'Review' : 'Practice'}</span>
            <h2>{fromWrong ? '错题复盘' : '配置一次专注刷题'}</h2>
            <p>
              选择一个训练目标和本轮题量。完成后可按错题和知识点继续复盘。
            </p>
          </div>

          {!fromWrong && (
            <div className="setup-section">
              <label className="setup-label">选择训练包</label>
              <div className="category-filter pack-filter">
                {practicePacks.map((pack) => {
                  const count = questions.filter(pack.match).length;
                  return (
                  <button
                    key={pack.id}
                    className={`filter-btn ${filter === pack.id ? 'active' : ''}`}
                    onClick={() => setFilter(pack.id)}
                  >
                    <strong>{pack.name}</strong>
                    <small>{pack.desc}</small>
                    <em>{count} 题</em>
                  </button>
                  );
                })}
              </div>
              <p className="setup-hint">训练包按面试能力组织，具体知识点会在答题解析中展示。</p>
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

          {!user && (
            <p className="setup-hint">
              未登录每日限 {getRemainingLearn()} 次学习，
              <button className="link-btn" onClick={() => navigate('/login')}>登录</button>后不限次数
            </p>
          )}

          {showLoginPrompt && (
            <div className="confirm-overlay">
              <div className="confirm-dialog">
                <h3>今日次数已用完</h3>
                <p>学习模式每日限 2 次免费使用，登录后不限次数。</p>
                <div className="confirm-actions">
                  <button className="btn btn-outline" onClick={() => { setShowLoginPrompt(false); navigate('/'); }}>
                    返回首页
                  </button>
                  <button className="btn btn-primary" onClick={() => { setShowLoginPrompt(false); navigate('/login'); }}>
                    去登录
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {/* 连击显示 */}
      {combo > 1 && (
        <div className="combo-bar">
          <span className="combo-count">{combo}</span>
          <span className="combo-label">连击</span>
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
                  <span className="option-text">正确</span>
                </button>
                <button
                  className={getOptionClass(1)}
                  onClick={() => handleSelectAnswer(1)}
                  disabled={showResult}
                >
                  <span className="option-label">B</span>
                  <span className="option-text">错误</span>
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
                  <span className="feedback-icon">回答正确</span>
                ) : (
                  <span className="feedback-icon">回答错误，已加入错题本</span>
                )}
              </div>
              <div className="feedback-correct-answer">
                <strong>正确答案：</strong>
                {currentQuestion.type === 'multiple'
                  ? currentQuestion.answer.map((i) => String.fromCharCode(65 + i)).join('、')
                  : currentQuestion.type === 'judge'
                    ? (currentQuestion.answer === 0 ? '正确' : '错误')
                    : String.fromCharCode(65 + currentQuestion.answer) + '. ' + currentQuestion.options[currentQuestion.answer]}
              </div>
              <div className="feedback-explanation">
                <strong>解析：</strong>
                {currentQuestion.explanation}
              </div>

              <div className="answer-tools">
                <button
                  className={`answer-tool-button ${isFavorite(currentQuestion.id) ? 'active' : ''}`}
                  onClick={() => { toggleFavorite(currentQuestion.id); setFavKey(f => f + 1); }}
                >
                  <Bookmark size={15} />
                  {isFavorite(currentQuestion.id) ? '已收藏' : '收藏题目'}
                </button>
                <button
                  className={`answer-tool-button ${getNote(currentQuestion.id) ? 'active note' : ''}`}
                  onClick={() => setNoteOpen((value) => !value)}
                >
                  <FilePenLine size={15} />
                  {getNote(currentQuestion.id) ? '编辑笔记' : '记录思路'}
                </button>
                <button className="answer-tool-button" onClick={() => navigate('/notes')}><LibraryBig size={15} />全部笔记</button>
              </div>

              {noteOpen && (
                <div className="inline-note-editor">
                  <div><strong>这道题的判断依据</strong><span>支持 Markdown，建议记录原因、风险和量产验证方法。</span></div>
                  <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="例如：卡扣根部需要圆角过渡，原因是..." />
                  <div className="inline-note-actions">
                    <button className="button secondary" onClick={() => { setNoteDraft(getNote(currentQuestion.id)); setNoteOpen(false); }}>取消</button>
                    <button className="button primary" onClick={() => { setNote(currentQuestion.id, noteDraft); setFavKey((value) => value + 1); setNoteOpen(false); }}><Check size={15} />保存笔记</button>
                  </div>
                </div>
              )}

              <div className="feedback-reference">
                <span className="reference-text">{currentQuestion.reference}</span>
              </div>

              {/* 知识文章深入展开 */}
              {currentQuestion.knowledge_id && (
                <KnowledgePanel knowledgeId={currentQuestion.knowledge_id} category={currentQuestion.category} />
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div className="rating-display">
                  {(() => {
                    const pct = Math.round((score.correct / score.total) * 100);
                    const level = pct >= 95 ? 'SSS' : pct >= 85 ? 'SS' : pct >= 70 ? 'S' : pct >= 55 ? 'A' : pct >= 40 ? 'B' : 'C';
                    const color = pct >= 85 ? '#10B981' : pct >= 70 ? '#3B82F6' : pct >= 40 ? '#F59E0B' : '#EF4444';
                    return <><span className="rating-badge" style={{ background: color }}>{level}</span>
                    <span className="rating-detail">{score.correct}/{score.total} · {maxCombo}连击</span></>;
                  })()}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
