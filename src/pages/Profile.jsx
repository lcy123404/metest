import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { getWrongCount } from '../utils/storage';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function loadData() {
      try {
        const { data: userStats } = await supabase
          .from('user_stats').select('*').eq('user_id', user.id).single();
        setStats(userStats);

        const { data: examResults } = await supabase
          .from('exam_results')
          .select('score,total,percentage,time_used,created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        setExams(examResults || []);
      } catch (e) {
        console.warn('加载数据失败', e.message);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m}分${s % 60}秒`;
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const wrongCount = getWrongCount();

  if (!user) {
    return (
      <div className="profile-page">
        <button className="btn btn-back" onClick={() => navigate('/')}>← 返回首页</button>
        <div className="login-prompt">
          <h2>👤 尚未登录</h2>
          <p>登录后可查看答题历史和统计数据</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <button className="btn btn-back" onClick={() => navigate('/')}>← 返回首页</button>

      <div className="profile-card">
        <div className="profile-avatar">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <h2>{user.email?.split('@')[0]}</h2>
        <p className="profile-email">{user.email}</p>
        <button className="btn btn-outline btn-sm" onClick={signOut}>
          退出登录
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><p>加载中...</p></div>
      ) : (
        <>
          <div className="profile-stats">
            <div className="profile-stat-card">
              <div className="profile-stat-value">{stats?.total_exams || 0}</div>
              <div className="profile-stat-label">考试次数</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">
                {stats ? Math.round((stats.correct_answers / stats.total_questions) * 100) : 0}%
              </div>
              <div className="profile-stat-label">总正确率</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{wrongCount}</div>
              <div className="profile-stat-label">错题本</div>
            </div>
          </div>

          <div className="result-categories">
            <h3>📋 最近考试记录</h3>
            {exams.length === 0 ? (
              <p style={{color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 20}}>
                还没有考试记录，去刷一套题吧！
              </p>
            ) : (
              exams.map((e, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--border)'
                }}>
                  <div>
                    <span style={{fontWeight: 600, fontSize: 14}}>
                      {e.score}/{e.total}
                    </span>
                    <span style={{color: 'var(--text-secondary)', fontSize: 12, marginLeft: 8}}>
                      {formatDate(e.created_at)}
                    </span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                    <span style={{fontSize: 12, color: 'var(--text-secondary)'}}>
                      {formatTime(e.time_used)}
                    </span>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      color: e.percentage >= 75 ? 'var(--success)' : e.percentage >= 50 ? 'var(--warning)' : 'var(--danger)'
                    }}>
                      {e.percentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <div style={{textAlign: 'center', padding: '10px 0'}}>
        <button className="btn btn-primary" onClick={() => navigate('/exam')}>
          开始新考试
        </button>
      </div>
    </div>
  );
}
