import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import questions from '../data/questions';
import { getWrongCount } from '../utils/storage';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const wrongCount = getWrongCount();

  const categories = [...new Set(questions.map((q) => q.category))];

  return (
    <div className="home-page">
      <div className="hero">
        <h2>选择你的练习方式</h2>
        <p>{questions.length}道精选题，覆盖塑胶·钣金·压铸·型材四大工艺</p>
      </div>

      <div className="mode-cards">
        <div className="mode-card learn-card" onClick={() => navigate('/learn')}>
          <div className="mode-icon">📖</div>
          <h3>学习模式</h3>
          <p className="mode-desc">
            逐题练习，即时反馈<br />
            答错有解析 + 深入了解<br />
            不限时间，自由复习
          </p>
          <ul className="mode-features">
            <li>✅ 即时判断对错</li>
            <li>✅ 详细解析 + 知识文章展开</li>
            <li>✅ 自动收集错题</li>
            <li>✅ 可选刷题数量 + 随机抽题</li>
          </ul>
          <button className="btn btn-primary">进入学习模式</button>
        </div>

        <div className="mode-card exam-card" onClick={() => navigate('/exam')}>
          <div className="mode-icon">⏱️</div>
          <h3>考试模式</h3>
          <p className="mode-desc">
            限时模拟考试<br />
            交卷后统一出分<br />
            检验真实水平
          </p>
          <ul className="mode-features">
            <li>✅ 可选题目数量 + 时长</li>
            <li>✅ 限时倒计时</li>
            <li>✅ 交卷后显示分数 + 错题入本</li>
            <li>✅ 分类掌握度评估</li>
          </ul>
          <button className="btn btn-accent">进入考试模式</button>
        </div>
      </div>

      {/* 错题本快捷入口 */}
      <div className="wrong-book-entry" onClick={() => navigate('/wrong-book')}>
        <div className="wrong-book-entry-icon">📝</div>
        <div className="wrong-book-entry-info">
          <h3>错题本</h3>
          <p>
            {wrongCount > 0
              ? `已收集 ${wrongCount} 道错题，点击复习`
              : '暂无错题，去刷题吧'}
          </p>
        </div>
        <span className="wrong-book-entry-arrow">→</span>
      </div>

      {/* 管理入口（仅登录用户可见） */}
      {user && (
        <div className="admin-entry" onClick={() => navigate('/admin/questions')}>
          <div className="admin-entry-icon">⚙️</div>
          <div className="admin-entry-info">
            <h3>题库管理</h3>
            <p>新增、编辑、导入题目</p>
          </div>
          <span className="wrong-book-entry-arrow">→</span>
        </div>
      )}

      <div className="category-section">
        <h3>题库分类（共 {questions.length} 题）</h3>
        <div className="category-tags">
          {categories.map((cat) => {
            const count = questions.filter((q) => q.category === cat).length;
            return (
              <span key={cat} className="category-tag">
                {cat}（{count}题）
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
