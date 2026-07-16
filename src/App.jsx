import { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  FilePenLine,
  FileText,
  Home as HomeIcon,
  LibraryBig,
  LogOut,
  Menu,
  Search,
  Settings2,
  Target,
  UserRound,
  X,
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import LearnMode from './pages/LearnMode';
import ExamMode from './pages/ExamMode';
import Result from './pages/Result';
import WrongBook from './pages/WrongBook';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminQuestions from './pages/AdminQuestions';
import ReviewQuestions from './pages/ReviewQuestions';
import InviteCodes from './pages/InviteCodes';
import KnowledgeBase from './pages/KnowledgeBase';
import Notes from './pages/Notes';
import KnowledgeGraph from './pages/KnowledgeGraph';
import AdminKnowledge from './pages/AdminKnowledge';
import AdminKnowledgeStructure from './pages/AdminKnowledgeStructure';
import './App.css';
import './design.css';

const navGroups = [
  {
    label: '学习工作台',
    items: [
      { to: '/', label: '今日总览', icon: HomeIcon, end: true },
      { to: '/learn', label: '题库训练', icon: Target },
      { to: '/exam', label: '模拟面试', icon: ClipboardCheck },
    ],
  },
  {
    label: '知识沉淀',
    items: [
      { to: '/kb', label: '结构知识库', icon: LibraryBig },
      { to: '/knowledge-graph', label: '知识图谱', icon: BrainCircuit },
      { to: '/notes', label: '我的笔记', icon: FileText },
      { to: '/admin/knowledge', label: '知识内容管理', icon: FilePenLine },
    ],
  },
  {
    label: '复盘与成长',
    items: [
      { to: '/wrong-book', label: '错题复盘', icon: BookOpen },
      { to: '/profile', label: '学习进度', icon: ChartNoAxesColumnIncreasing },
    ],
  },
];

const routeTitles = [
  ['/knowledge-graph', '知识图谱'],
  ['/wrong-book', '错题复盘'],
  ['/admin', '内容管理'],
  ['/profile', '学习进度'],
  ['/notes', '我的笔记'],
  ['/learn', '题库训练'],
  ['/exam', '模拟面试'],
  ['/result', '考试报告'],
  ['/login', '账号登录'],
  ['/kb', '结构知识库'],
  ['/', '今日总览'],
];

function AppNavigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageTitle = routeTitles.find(([path]) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path))?.[1] || '构题库';
  const displayName = user?.email?.split('@')[0] || '访客用户';

  const submitSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/kb?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`app-rail ${mobileMenuOpen ? 'is-open' : ''}`}>
        <Link to="/" className="rail-brand" aria-label="构题库首页" onClick={() => setMobileMenuOpen(false)}>
          <span className="rail-brand-mark">构</span>
          <span><strong>构题库</strong><small>结构工程师成长站</small></span>
        </Link>

        <nav className="rail-nav" aria-label="主导航">
          {navGroups.map((group) => (
            <div className="rail-group" key={group.label}>
              <span className="rail-group-label">{group.label}</span>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setMobileMenuOpen(false)}>
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="rail-account">
          <Link to={user ? '/profile' : '/login'} className="rail-user" onClick={() => setMobileMenuOpen(false)}>
            <span className="rail-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <span><strong>{displayName}</strong><small>{user ? '学习记录已同步' : '登录以同步进度'}</small></span>
          </Link>
          {user && <button className="icon-button" onClick={signOut} aria-label="退出登录" title="退出登录"><LogOut size={17} /></button>}
        </div>
      </aside>

      {mobileMenuOpen && <button className="rail-backdrop" aria-label="关闭导航" onClick={() => setMobileMenuOpen(false)} />}

      <div className="app-stage">
        <header className="command-bar">
          <div className="command-title">
            <button className="mobile-menu-button" onClick={() => setMobileMenuOpen((value) => !value)} aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div><span>STRUCTURE INTERVIEW OS</span><strong>{pageTitle}</strong></div>
          </div>
          <form className="global-search" onSubmit={submitSearch}>
            <Search size={17} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索题目、工艺或知识点" aria-label="全局搜索" />
            <kbd>Enter</kbd>
          </form>
          <div className="command-actions">
            <Link className="icon-button" to="/admin/questions" aria-label="内容管理" title="内容管理"><Settings2 size={18} /></Link>
            <Link className="command-profile" to={user ? '/profile' : '/login'}>
              <UserRound size={17} />
              <span>{user ? displayName : '登录'}</span>
            </Link>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<LearnMode />} />
            <Route path="/exam" element={<ExamMode />} />
            <Route path="/result" element={<Result />} />
            <Route path="/wrong-book" element={<WrongBook />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/knowledge" element={<AdminKnowledge />} />
            <Route path="/admin/knowledge-structure" element={<AdminKnowledgeStructure />} />
            <Route path="/admin/review" element={<ReviewQuestions />} />
            <Route path="/admin/invite" element={<InviteCodes />} />
            <Route path="/kb" element={<KnowledgeBase />} />
          </Routes>
        </main>

        <nav className="mobile-tabbar" aria-label="移动端主导航">
          <NavLink to="/" end><HomeIcon size={19} /><span>总览</span></NavLink>
          <NavLink to="/learn"><Target size={19} /><span>刷题</span></NavLink>
          <NavLink to="/kb"><LibraryBig size={19} /><span>知识库</span></NavLink>
          <NavLink to="/profile"><UserRound size={19} /><span>我的</span></NavLink>
        </nav>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppNavigation />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
