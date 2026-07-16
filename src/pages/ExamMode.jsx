import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import questions from '../data/questions';
import { addWrongIds } from '../utils/storage';
import { canUseExam, recordExamUse, getRemainingExam } from '../utils/guestLimit';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const countOptions = [10, 20, 30, 40];
const timeOptions = [
  { label: '10分钟', value: 10 },
  { label: '20分钟', value: 20 },
  { label: '30分钟', value: 30 },
  { label: '45分钟', value: 45 },
];

export default function ExamMode() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 配置
  const [questionCount, setQuestionCount] = useState(20);
  const [examTime, setExamTime] = useState(20); // 分钟
  const [started, setStarted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 考试题目（开始后生成）
  const [examQuestions, setExamQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState({});
  const timerRef = useRef(null);

  // 随机抽题
  const handleStart = () => {
    if (!user && !canUseExam()) {
      setShowLoginPrompt(true);
      return;
    }
    if (!user) recordExamUse();
    const pool = shuffle(questions);
    const limit = questionCount === 0 ? pool.length : Math.min(questionCount, pool.length);
    setExamQuestions(pool.slice(0, limit));
    setTimeLeft(examTime * 60);
    setStarted(true);
    setAnswers({});
  };

  // 倒计时
  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, timeLeft]);

  // 时间到了自动交卷
  useEffect(() => {
    if (started && timeLeft === 0 && examQuestions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleMultiAnswer = (questionId, index) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(index)) {
        return { ...prev, [questionId]: current.filter((i) => i !== index) };
      }
      return { ...prev, [questionId]: [...current, index] };
    });
  };

  const calculateScore = useCallback(() => {
    let correct = 0;
    const details = [];
    const wrongIds = [];

    examQuestions.forEach((q) => {
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (q.type === 'multiple') {
        const userArr = (userAnswer || []).sort();
        const correctArr = [...q.answer].sort();
        isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
      } else {
        isCorrect = userAnswer === q.answer;
      }

      if (!isCorrect) wrongIds.push(q.id);
      if (isCorrect) correct++;

      details.push({ ...q, userAnswer, isCorrect });
    });

    // 错题自动入错题本
    if (wrongIds.length > 0) addWrongIds(wrongIds);

    return {
      score: correct,
      total: examQuestions.length,
      percentage: Math.round((correct / examQuestions.length) * 100),
      details,
      questionIds: examQuestions.map((q) => q.id),
    };
  }, [answers, examQuestions]);

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    const result = calculateScore();
    const timeUsedSeconds = examTime * 60 - timeLeft;

    // 保存到 Supabase（如果已登录）
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const detailForDB = result.details.map(d => ({
          id: d.id, question: d.question, category: d.category,
          type: d.type, userAnswer: d.userAnswer, isCorrect: d.isCorrect,
        }));
        await supabase.from('exam_results').insert({
          user_id: user.id, score: result.score, total: result.total,
          percentage: result.percentage, time_used: timeUsedSeconds,
          details: detailForDB,
        });
        // 更新统计
        const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();
        if (stats) {
          await supabase.from('user_stats').update({
            total_exams: stats.total_exams + 1,
            total_questions: stats.total_questions + result.total,
            correct_answers: stats.correct_answers + result.score,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);
        } else {
          await supabase.from('user_stats').insert({
            user_id: user.id, total_exams: 1,
            total_questions: result.total, correct_answers: result.score,
          });
        }
      }
    } catch (e) {
      console.warn('保存成绩失败（离线/未登录）', e.message);
    }

    navigate('/result', { state: { ...result, timeUsed: timeUsedSeconds } });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter((k) => {
    const ans = answers[k];
    if (Array.isArray(ans)) return ans.length > 0;
    return ans !== undefined && ans !== null;
  }).length;

  // ======== 考试前配置 ========
  if (!started) {
    return (
      <div className="exam-page">
        <button className="btn btn-back" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
        <div className="exam-intro">
          <h2>模拟考试</h2>

          <div className="setup-card">
            <div className="setup-section">
              <label className="setup-label">题目数量</label>
              <div className="count-selector">
                {countOptions.map((n) => (
                  <button
                    key={n}
                    className={`count-btn ${questionCount === n ? 'active' : ''}`}
                    onClick={() => setQuestionCount(n)}
                  >
                    {n === 0 ? `全部(${questions.length}题)` : `${n}题`}
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <label className="setup-label">考试时长</label>
              <div className="count-selector">
                {timeOptions.map((t) => (
                  <button
                    key={t.value}
                    className={`count-btn ${examTime === t.value ? 'active' : ''}`}
                    onClick={() => setExamTime(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="exam-rules">
              <h4>考试规则：</h4>
              <ul>
                <li>随机抽取 {questionCount === 0 ? questions.length : questionCount} 道题</li>
                <li>限时{examTime}分钟，倒计时结束自动交卷</li>
                <li>包含单选题、多选题和判断题</li>
                <li>交卷后显示分数和详细答题情况</li>
                <li>错题自动加入错题本</li>
              </ul>
            </div>

            <button className="btn btn-accent btn-large" onClick={handleStart}>
              开始考试
            </button>

            {!user && (
              <p className="setup-hint" style={{ marginTop: 16 }}>
                未登录每日限 {getRemainingExam()} 次考试，
                <button className="link-btn" onClick={() => navigate('/login')}>登录</button>后不限次数
              </p>
            )}

            {showLoginPrompt && (
              <div className="confirm-overlay">
                <div className="confirm-dialog">
                  <h3>今日次数已用完</h3>
                  <p>考试模式每日限 1 次免费使用，登录后不限次数。</p>
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
      </div>
    );
  }

  // ======== 考试中 ========
  return (
    <div className="exam-page">
      {/* 顶部工具栏 */}
      <div className="exam-toolbar">
        <div className="exam-timer">
          剩余时间 <span className={timeLeft < 300 ? 'timer-warning' : ''}>{formatTime(timeLeft)}</span>
        </div>
        <div className="exam-progress-info">
          已答 {answeredCount}/{examQuestions.length}
        </div>
        <div className="exam-toolbar-actions">
          <button className="btn btn-back" onClick={() => setShowExitConfirm(true)}>
            退出考试
          </button>
          <button className="btn btn-accent" onClick={handleSubmit}>
            交卷
          </button>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="exam-questions">
        {examQuestions.map((q, idx) => (
          <div key={q.id} className={`exam-question-card ${answers[q.id] !== undefined ? 'answered' : ''}`}>
            <div className="exam-question-header">
              <span className="question-number">第 {idx + 1} 题</span>
              <span className={`difficulty-tag ${q.difficulty}`}>
                {q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <span className="type-tag">
                {q.type === 'single' ? '单选' : q.type === 'multiple' ? '多选' : '判断'}
              </span>
              <span className="category-tag">{q.category}</span>
            </div>

            <p className="exam-question-text">{q.question}</p>

            <div className="exam-options">
              {q.type === 'judge' ? (
                <>
                  <button
                    className={`exam-option ${answers[q.id] === 0 ? 'selected' : ''}`}
                    onClick={() => handleAnswer(q.id, 0)}
                  >
                    <span className="option-label">A</span> 正确 ✓
                  </button>
                  <button
                    className={`exam-option ${answers[q.id] === 1 ? 'selected' : ''}`}
                    onClick={() => handleAnswer(q.id, 1)}
                  >
                    <span className="option-label">B</span> 错误 ✗
                  </button>
                </>
              ) : q.type === 'multiple' ? (
                q.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`exam-option ${(answers[q.id] || []).includes(i) ? 'selected' : ''}`}
                    onClick={() => handleMultiAnswer(q.id, i)}
                  >
                    <span className="option-label">{String.fromCharCode(65 + i)}</span> {opt}
                  </button>
                ))
              ) : (
                q.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`exam-option ${answers[q.id] === i ? 'selected' : ''}`}
                    onClick={() => handleAnswer(q.id, i)}
                  >
                    <span className="option-label">{String.fromCharCode(65 + i)}</span> {opt}
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 底部交卷按钮 */}
      <div className="exam-footer">
        <button className="btn btn-accent btn-large" onClick={handleSubmit}>
          交卷
        </button>
      </div>

      {/* 退出确认 */}
      {showExitConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>确定要退出考试吗？<br />已作答的题目不会保存，计时不会暂停。</p>
            <div className="confirm-actions">
              <button className="btn btn-outline" onClick={() => setShowExitConfirm(false)}>
                继续考试
              </button>
              <button className="btn btn-danger" onClick={() => navigate('/')}>
                确定退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
