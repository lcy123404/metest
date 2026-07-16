import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookMarked,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Clock3,
  Factory,
  FilePenLine,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import questions from '../data/questions';
import { getWrongCount } from '../utils/storage';
import { getNotes } from '../utils/favorites';
import { getPracticeProgress } from '../utils/progress';
import wikiSections, { findWikiPage } from '../data/wiki';
import heroImage from '../assets/hero.png';

function dailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const practiceTracks = [
  { id: 'foundation', title: '基础补全', meta: '材料 / 塑胶 / 机械基础', count: 30, tone: 'blue' },
  { id: 'process', title: '制造工艺', meta: '注塑 / 钣金 / 压铸 / CNC', count: 40, tone: 'amber' },
  { id: 'advanced', title: '面试进阶', meta: '公差 / DFM / 可靠性 / NPI', count: 20, tone: 'green' },
];

const knowledgeSteps = [
  { title: '4.1 塑胶件设计规范', topic: 'plastic-part-rules', tag: '高频' },
  { title: '3.1 塑胶材料', topic: 'plastic-materials', tag: '基础' },
  { title: '1.4 公差配合与测量技术', topic: 'tolerance-measurement', tag: '进阶' },
];

function difficultyLabel(value) {
  if (value === 'hard') return '困难';
  if (value === 'medium') return '中等';
  return '基础';
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dailyRound, setDailyRound] = useState(0);
  const progress = getPracticeProgress();
  const wrongCount = getWrongCount();
  const notesCount = Object.keys(getNotes()).length;
  const todayKey = new Date().toDateString();
  const todayAnswers = progress.recent.filter((item) => new Date(item.answeredAt).toDateString() === todayKey);
  const todayCorrect = todayAnswers.filter((item) => item.isCorrect).length;
  const todayTarget = 20;
  const todayPercent = Math.min(100, Math.round((todayAnswers.length / todayTarget) * 100));
  const accuracy = progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0;
  const displayName = user?.email?.split('@')[0] || '工程师';
  const dateLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());

  const dailyQs = useMemo(
    () => seededShuffle(questions, dailySeed() + dailyRound * 97).slice(0, 5),
    [dailyRound]
  );

  const abilityRows = useMemo(() => wikiSections.map((category) => {
    const categoryQuestions = questions.filter((question) => findWikiPage(question.knowledge_id, question.category)?.sectionId === category.id);
    const practiced = categoryQuestions.filter((question) => progress.questionIds.includes(question.id)).length;
    const percent = Math.min(100, Math.round((practiced / Math.min(40, Math.max(1, categoryQuestions.length))) * 100));
    return { ...category, total: categoryQuestions.length, practiced, percent, topic: category.pages[0]?.id };
  }), [progress.questionIds]);

  const startDailySet = () => {
    navigate(`/learn?ids=${dailyQs.map((question) => question.id).join(',')}&autostart=1`);
  };

  return (
    <div className="workspace-page home-workspace">
      <header className="workspace-welcome">
        <div>
          <span className="workspace-eyebrow">{dateLabel}</span>
          <h1>{displayName}，今天从哪项能力开始？</h1>
          <p>围绕面试目标完成一次短训练，再把错题和笔记沉淀回知识网络。</p>
        </div>
        <div className="welcome-actions">
          <button className="button secondary" onClick={() => navigate('/knowledge-graph')}><Boxes size={17} />查看能力图谱</button>
          <button className="button primary" onClick={startDailySet}><Target size={17} />开始今日五题</button>
        </div>
      </header>

      <section className="daily-command" aria-label="今日学习进度">
        <div className="daily-ring" style={{ '--progress': `${todayPercent * 3.6}deg` }}><strong>{todayPercent}%</strong></div>
        <div className="daily-command-copy">
          <span>TODAY'S PLAN</span>
          <h2>今日训练目标：完成 {todayTarget} 道题</h2>
          <p>已完成 {todayAnswers.length} 题，答对 {todayCorrect} 题。建议先做一组高频题，再复盘错题。</p>
        </div>
        <div className="daily-plan-steps">
          <button className={todayAnswers.length >= 5 ? 'is-done' : ''} onClick={startDailySet}>
            <span><CheckCircle2 size={17} /></span><div><strong>每日热身</strong><small>5 道高频题</small></div><ChevronRight size={16} />
          </button>
          <button className={wrongCount === 0 ? 'is-done' : ''} onClick={() => navigate('/wrong-book')}>
            <span><RotateCcw size={17} /></span><div><strong>错题复盘</strong><small>{wrongCount} 道待处理</small></div><ChevronRight size={16} />
          </button>
          <button onClick={() => navigate('/notes')}>
            <span><FilePenLine size={17} /></span><div><strong>整理笔记</strong><small>{notesCount} 条已沉淀</small></div><ChevronRight size={16} />
          </button>
        </div>
      </section>

      <div className="dashboard-columns">
        <div className="dashboard-primary">
          <section className="workspace-section">
            <div className="section-heading">
              <div><span>ABILITY MAP</span><h2>面试能力地图</h2></div>
              <button className="text-action" onClick={() => navigate('/knowledge-graph')}>查看知识关联 <ArrowRight size={15} /></button>
            </div>
            <div className="ability-table">
              {abilityRows.map((item, index) => (
                <button key={item.id} onClick={() => navigate(`/kb?topic=${item.topic}`)}>
                  <span className="ability-number">0{index + 1}</span>
                  <div className="ability-name"><strong>{item.title.replace(/^第[一二三四五六七八九]模块：/, '')}</strong><small>{item.total ? `${item.total} 道关联题` : `${item.pages.length} 个知识节点`} · 已练 {item.practiced}</small></div>
                  <div className="ability-progress"><span style={{ width: `${item.percent}%` }} /></div>
                  <em>{item.percent}%</em>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>

          <section className="workspace-section">
            <div className="section-heading">
              <div><span>PRACTICE TRACKS</span><h2>按目标训练</h2></div>
              <button className="text-action" onClick={() => navigate('/learn')}>自定义题组 <ArrowRight size={15} /></button>
            </div>
            <div className="practice-track-grid">
              {practiceTracks.map((track) => (
                <button key={track.id} className={`practice-track ${track.tone}`} onClick={() => navigate(`/learn?pack=${track.id}&count=${track.count}&shuffle=1`)}>
                  <span><Factory size={19} /></span>
                  <strong>{track.title}</strong>
                  <small>{track.meta}</small>
                  <em>{track.count} 题训练 <ArrowRight size={14} /></em>
                </button>
              ))}
            </div>
          </section>

          <section className="workspace-section">
            <div className="section-heading">
              <div><span>DAILY QUESTIONS</span><h2>今日五题预览</h2></div>
              <button className="text-action" onClick={() => setDailyRound((round) => round + 1)}>换一组 <RotateCcw size={14} /></button>
            </div>
            <div className="question-preview-list">
              {dailyQs.map((question, index) => (
                <button key={question.id} onClick={() => navigate(`/learn?ids=${question.id}&autostart=1`)}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{question.question}</strong>
                  <small>{question.category}</small>
                  <em className={question.difficulty}>{difficultyLabel(question.difficulty)}</em>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="dashboard-secondary">
          <section className="focus-visual">
            <div className="focus-visual-copy">
              <span><Sparkles size={14} /> 本周专题</span>
              <h2>塑胶件结构设计</h2>
              <p>从材料、壁厚到模具缺陷，完成一条面试高频知识链。</p>
              <button onClick={() => navigate('/kb?topic=plastic-part-rules')}>进入专题 <ArrowRight size={14} /></button>
            </div>
            <img src={heroImage} alt="产品结构分层示意" />
          </section>

          <section className="metric-panel">
            <div className="section-heading compact"><div><span>LEARNING DATA</span><h2>学习数据</h2></div></div>
            <div className="metric-grid">
              <div><CircleGauge size={18} /><strong>{accuracy}%</strong><span>累计正确率</span></div>
              <div><Flame size={18} /><strong>{progress.questionIds.length}</strong><span>已练题目</span></div>
              <div><BookMarked size={18} /><strong>{wrongCount}</strong><span>待复盘错题</span></div>
              <div><FilePenLine size={18} /><strong>{notesCount}</strong><span>知识笔记</span></div>
            </div>
          </section>

          <section className="knowledge-queue">
            <div className="section-heading compact"><div><span>KNOWLEDGE QUEUE</span><h2>建议继续学习</h2></div></div>
            {knowledgeSteps.map((item, index) => (
              <button key={item.topic} onClick={() => navigate(`/kb?topic=${item.topic}`)}>
                <span>{index + 1}</span><div><strong>{item.title}</strong><small>{item.tag} · 关联题目与解析</small></div><ChevronRight size={16} />
              </button>
            ))}
          </section>

          <section className="exam-prompt">
            <Clock3 size={20} />
            <div><strong>准备检验学习结果？</strong><span>100 题 · 90 分钟 · 提交后统一解析</span></div>
            <button className="icon-button" onClick={() => navigate('/exam')} aria-label="开始模拟面试" title="开始模拟面试"><ArrowRight size={17} /></button>
          </section>
        </aside>
      </div>
    </div>
  );
}
