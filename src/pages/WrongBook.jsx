import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import questions from '../data/questions';
import { getWrongIds, removeWrongId, clearWrongBook } from '../utils/storage';
import KnowledgePanel from '../components/KnowledgePanel';

export default function WrongBook() {
  const navigate = useNavigate();
  const [wrongIds, setWrongIds] = useState(getWrongIds());
  const [showConfirm, setShowConfirm] = useState(false);

  const wrongQuestions = useMemo(() => {
    return questions.filter((q) => wrongIds.includes(q.id));
  }, [wrongIds]);

  const handleRemove = (id) => {
    removeWrongId(id);
    setWrongIds(getWrongIds());
  };

  const handleClearAll = () => {
    clearWrongBook();
    setWrongIds([]);
    setShowConfirm(false);
  };

  const handleOpenReference = (url) => {
    window.open(url, '_blank', 'noopener');
  };

  if (wrongQuestions.length === 0) {
    return (
      <div className="wrong-book-page">
        <button className="btn btn-back" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h3>错题本为空</h3>
          <p>暂时没有错题，继续保持！</p>
          <button className="btn btn-primary" onClick={() => navigate('/learn')}>
            去学习模式刷题
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrong-book-page">
      <div className="wrong-book-header">
        <button className="btn btn-back" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
        <div className="wrong-book-title">
          <h2>📝 错题本</h2>
          <span className="wrong-count">{wrongQuestions.length} 道错题</span>
        </div>
        <button
          className="btn btn-outline btn-danger-outline"
          onClick={() => setShowConfirm(true)}
        >
          清空错题本
        </button>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <p>确定要清空所有错题吗？此操作不可撤销。</p>
            <div className="confirm-actions">
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>
                取消
              </button>
              <button className="btn btn-danger" onClick={handleClearAll}>
                确定清空
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wrong-book-actions">
        <button className="btn btn-primary" onClick={() => navigate('/learn?from=wrong')}>
          刷错题（学习模式）
        </button>
      </div>

      <div className="wrong-book-list">
        {wrongQuestions.map((q, idx) => (
          <div key={q.id} className="wrong-question-card">
            <div className="wrong-question-header">
              <span className="question-number">{idx + 1}.</span>
              <span className={`difficulty-tag ${q.difficulty}`}>
                {q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <span className="category-tag">{q.category}</span>
              <span className="type-tag">
                {q.type === 'single' ? '单选' : q.type === 'multiple' ? '多选' : '判断'}
              </span>
            </div>
            <p className="wrong-question-text">{q.question}</p>

            <div className="wrong-answer-info">
              <strong>正确答案：</strong>
              {q.type === 'multiple'
                ? q.answer.map((i) => String.fromCharCode(65 + i)).join('、')
                : q.type === 'judge'
                  ? (q.answer === 0 ? '正确 ✓' : '错误 ✗')
                  : `${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}`}
            </div>

            <div className="wrong-explanation">
              <strong>解析：</strong>{q.explanation}
            </div>

            <div className="wrong-reference-row">
              <a
                className="reference-link"
                href={q.reference_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.preventDefault(); handleOpenReference(q.reference_url); }}
              >
                📚 {q.reference} →
              </a>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleRemove(q.id)}
              >
                已掌握，移出错题本
              </button>
            </div>

            {q.knowledge_id && (
              <KnowledgePanel knowledgeId={q.knowledge_id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
