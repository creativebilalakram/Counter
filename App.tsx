import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  List, 
  History, 
  Settings as SettingsIcon, 
  Plus, 
  Command,
  Sparkles,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Counter, Theme } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import CounterList from './components/CounterList.tsx';
import CounterDetail from './components/CounterDetail.tsx';
import HistoryView from './components/HistoryView.tsx';
import CommandPalette from './components/CommandPalette.tsx';
import CounterModal from './components/CounterModal.tsx';
import SettingsView from './components/SettingsView.tsx';
import { useCounters } from './hooks/useCounters.ts';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, path: '/' },
    { icon: List, path: '/counters' },
    { icon: History, path: '/history' },
    { icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 glass rounded-[32px] px-2 py-2 premium-shadow z-50 flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/counters' && location.pathname.startsWith('/counter/'));
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative p-4 rounded-[24px] transition-all duration-500 overflow-hidden ${
              isActive 
                ? 'text-slate-900 dark:text-white' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId="nav-bg"
                className="absolute inset-0 bg-slate-900/5 dark:bg-white/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </nav>
  );
};

const Header = ({ 
  onOpenNewCounter, 
  onOpenCommand, 
  theme, 
  setTheme 
}: { 
  onOpenNewCounter: () => void, 
  onOpenCommand: () => void,
  theme: Theme,
  setTheme: (t: Theme) => void
}) => {
  const Icon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-8 py-6 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto cursor-pointer group" onClick={() => window.location.hash = '/'}>
        <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center text-slate-900 dark:text-white premium-shadow transition-all group-hover:scale-110 group-active:scale-95">
          <Sparkles size={20} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Ethereal</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
          onClick={() => {
            const themes: Theme[] = ['system', 'light', 'dark'];
            setTheme(themes[(themes.indexOf(theme) + 1) % themes.length]);
          }}
          className="w-11 h-11 rounded-2xl glass flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
        >
          <Icon size={18} />
        </button>
        <button 
          onClick={onOpenCommand}
          className="w-11 h-11 rounded-2xl glass flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
        >
          <Command size={18} />
        </button>
        <button 
          onClick={onOpenNewCounter}
          className="h-11 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest premium-shadow hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> <span className="hidden md:inline">New Tally</span>
        </button>
      </div>
    </header>
  );
};

const AppContent = () => {
  const { counters, addCounter, updateCounter, incrementCounter, decrementCounter, deleteCounter, clearAllData, importData, resetCounter, startSession, endSession } = useCounters();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewCounterOpen, setIsNewCounterOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('ethereal_theme') as Theme) || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('ethereal_theme', theme);
    const applyTheme = (isDark: boolean) => isDark ? root.classList.add('dark') : root.classList.remove('dark');
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen pt-28 pb-40 px-6 max-w-5xl mx-auto">
      <Header onOpenNewCounter={() => setIsNewCounterOpen(true)} onOpenCommand={() => setIsCommandOpen(true)} theme={theme} setTheme={setTheme} />
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard counters={counters} />} />
          <Route path="/counters" element={<CounterList counters={counters} onIncrement={incrementCounter} onDecrement={decrementCounter} onDelete={deleteCounter} />} />
          <Route path="/counter/:id" element={<CounterDetail counters={counters} onIncrement={incrementCounter} onDecrement={decrementCounter} onReset={resetCounter} onUpdate={updateCounter} onDelete={deleteCounter} onStartSession={startSession} onEndSession={endSession} />} />
          <Route path="/history" element={<HistoryView counters={counters} />} />
          <Route path="/settings" element={<SettingsView counters={counters} onImport={importData} onClear={clearAllData} theme={theme} setTheme={setTheme} />} />
        </Routes>
      </AnimatePresence>

      <Navigation />

      <AnimatePresence>
        {isCommandOpen && <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} counters={counters} />}
        {isNewCounterOpen && (
          <CounterModal 
            isOpen={isNewCounterOpen} 
            onClose={() => setIsNewCounterOpen(false)}
            onSave={(counter) => { addCounter(counter); setIsNewCounterOpen(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;