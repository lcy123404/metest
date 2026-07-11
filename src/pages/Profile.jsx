import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function getStats() {
  try {
    const stored = localStorage.getItem('quiz_stats');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { totalAnswered: 0, correctCount: 0, wrongBook: [] };
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = getStats();
  const totalAnswered = stats.totalAnswered || 0;
  const correctCount = stats.correctCount || 0;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const wrongBookCount = (stats.wrongBook || []).length;

  return (
    <div className="page-container">
      <button className="btn btn-back" onClick={() => navigate('/')}>
        ← 返回首页
      </button>

      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 32 }}>个人中心</h1>

        {user ? (
          <div className="setup-card" style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                margin: '0 auto 12px',
              }}>
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <p style={{ fontSize: 16, fontWeight: 500, margin: 0, color: 'var(--text)' }}>
                {user.email || '已登录用户'}
              </p>
            </div>
          </div>
        ) : (
          <div className="setup-card" style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              您还未登录，请先登录查看个人信息
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              前往登录
            </button>
          </div>
        )}

        <h3 style={{ marginBottom: 16, color: 'var(--text)' }}>学习统计</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          <div className="setup-card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
              {totalAnswered}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>总刷题数</div>
          </div>

          <div className="setup-card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>正确率</div>
          </div>

          <div className="setup-card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>
              {wrongBookCount}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>错题本数量</div>
          </div>
        </div>

        {totalAnswered === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: 14,
            padding: 24,
            background: 'var(--card-bg)',
            borderRadius: 'var(--radius)',
          }}>
            还没有刷题记录，快去首页开始练习吧！
          </div>
        )}
      </div>
    </div>
  );
}
