import { useLocation, useNavigate } from 'react-router-dom';
import KnowledgePanel from '../components/KnowledgePanel';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  if (!result) {
    return (
      <div className="result-page">
        <div className="empty-state">
          <p>暂无考试结果</p>
          <button className="btn btn-primary" onClick={() => navigate('/exam')}>
            去考试
          </button>
        </div>
      </div>
    );
  }

  const { score, total, percentage, timeUsed, details } = result;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}分${s}秒`;
  };

  const getGradeInfo = (pct) => {
    if (pct >= 90) return { grade: '优秀', color: '#22c55e', emoji: '🌟' };
    if (pct >= 75) return { grade: '良好', color: '#3b82f6', emoji: '👍' };
    if (pct >= 60) return { grade: '及格', color: '#f59e0b', emoji: '📚' };
    return { grade: '需加强', color: '#ef4444', emoji: '💪' };
  };

  const gradeInfo = getGradeInfo(percentage);

  const handleOpenReference = (url) => {
    window.open(url, '_blank', 'noopener');
  };

  // 分类统计
  const categoryStats = {};
  details.forEach((d) => {
    if (!categoryStats[d.category]) {
      categoryStats[d.category] = { total: 0, correct: 0 };
    }
    categoryStats[d.category].total++;
    if (d.isCorrect) categoryStats[d.category].correct++;
  });

  return (
    <div className="result-page">
      <button className="btn btn-back" onClick={() => navigate('/')}>
        ← 返回首页
      </button>

      {/* 成绩概览 */}
      <div className="result-hero">
        <div className="result-score-circle" style={{ borderColor: gradeInfo.color }}>
          <span className="result-percentage" style={{ color: gradeInfo.color }}>
            {percentage}
          </span>
          <span className="result-label">分</span>
        </div>
        <div className="result-summary">
          <h2>
            {gradeInfo.emoji} {gradeInfo.grade}
          </h2>
          <div className="result-stats">
            <div className="stat-item">
              <span className="stat-value">{score}/{total}</span>
              <span className="stat-label">正确/总题数</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatTime(timeUsed)}</span>
              <span className="stat-label">用时</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {total > 0 ? Math.round((score / total) * 100) / 10 : 0}/10
              </span>
              <span className="stat-label">得分</span>
            </div>
          </div>
          <p className="result-wrong-hint">
            错题已自动加入错题本 📝
          </p>
        </div>
      </div>

      {/* 分类分析 */}
      <div className="result-categories">
        <h3>📊 分类掌握度</h3>
        <div className="category-bars">
          {Object.entries(categoryStats).map(([cat, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
            return (
              <div key={cat} className="category-bar-row">
                <div className="category-bar-label">
                  <span>{cat}</span>
                  <span>{stats.correct}/{stats.total}</span>
                </div>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 错题回顾 */}
      <div className="result-details">
        <h3>📝 答题详情（错题已入错题本）</h3>
        {details.map((d, idx) => (
          <div key={d.id} className={`result-question ${d.isCorrect ? 'correct-bg' : 'wrong-bg'}`}>
            <div className="result-question-header">
              <span className="question-number">
                {idx + 1}. {d.isCorrect ? '✅' : '❌'}
              </span>
              <span className={`difficulty-tag ${d.difficulty}`}>
                {d.difficulty === 'easy' ? '简单' : d.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <span className="category-tag">{d.category}</span>
            </div>
            <p className="result-question-text">{d.question}</p>

            <div className="result-answer-info">
              <div>
                <strong>你的答案：</strong>
                {d.type === 'multiple'
                  ? (d.userAnswer || []).length > 0
                    ? (d.userAnswer || []).map((i) => String.fromCharCode(65 + i)).join('、')
                    : '未作答'
                  : d.userAnswer !== undefined
                    ? d.type === 'judge'
                      ? (d.userAnswer === 0 ? '正确 ✓' : '错误 ✗')
                      : `${String.fromCharCode(65 + d.userAnswer)}. ${d.options[d.userAnswer]}`
                    : '未作答'}
              </div>
              {!d.isCorrect && (
                <div>
                  <strong>正确答案：</strong>
                  {d.type === 'multiple'
                    ? d.answer.map((i) => String.fromCharCode(65 + i)).join('、')
                    : d.type === 'judge'
                      ? (d.answer === 0 ? '正确 ✓' : '错误 ✗')
                      : `${String.fromCharCode(65 + d.answer)}. ${d.options[d.answer]}`}
                </div>
              )}
            </div>

            {!d.isCorrect && (
              <>
                <div className="result-explanation">
                  <strong>解析：</strong>
                  {d.explanation}
                </div>
                <div className="result-reference">
                  <a
                    className="reference-link"
                    href={d.reference_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.preventDefault(); handleOpenReference(d.reference_url); }}
                  >
                    📚 {d.reference} →
                  </a>
                </div>

                {/* 知识文章深入展开 */}
                {d.knowledge_id && (
                  <KnowledgePanel knowledgeId={d.knowledge_id} />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={() => navigate('/exam')}>
          重新考试
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/learn')}>
          进入学习模式
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/wrong-book')}>
          查看错题本
        </button>
      </div>
    </div>
  );
}
