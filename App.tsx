
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Monitor,
  Trash2,
  Download,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Counter, Theme } from './types';
import Dashboard from './components/Dashboard';
import CounterList from './components/CounterList';
import CounterDetail from './components/CounterDetail';
import HistoryView from './components/HistoryView';
import CommandPalette from './components/CommandPalette';
import CounterModal from './components/CounterModal';
import { useCounters } from './hooks/useCounters';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: List, label: 'Counters', path: '/counters' },
    { icon: History, label: 'Analytics', path: '/history' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2.5 spring-shadow z-50 flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/counters' && location.pathname.startsWith('/counter/'));
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 spring-shadow' 
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            {isActive && <span className="text-sm font-bold">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
};

const SettingsView = ({ onClearData, counters }: { onClearData: () => void, counters: Counter[] }) => {
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(counters));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `tally_backup_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto space-y-8 pb-12"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Configure your premium experience.</p>
      </div>

      <div className="glass rounded-[32px] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 spring-shadow">
        <button 
          onClick={exportData}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center spring-shadow">
              <Download size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Full Backup</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-0.5">Export JSON Archive</p>
            </div>
          </div>
        </button>

        <button 
          onClick={onClearData}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-red-50/50 dark:hover:bg-red-500/5 transition-colors group"
        >
          <div className="flex items-center gap-5 text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center spring-shadow">
              <Trash2 size={22} />
            </div>
            <div>
              <p className="font-bold text-red-600">Factory Reset</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-0.5">Wipe All Cloud & Local Data</p>
            </div>
          </div>
        </button>

        <div className="px-8 py-8 flex items-center gap-5 opacity-70">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center spring-shadow">
            <Info size={22} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-none">Ethereal Tally v2.1</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Production Build Stable</p>
          </div>
        </div>
      </div>
    </motion.div>
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
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto cursor-pointer group" onClick={() => window.location.hash = '/'}>
        <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 spring-shadow group-hover:scale-105 transition-transform duration-300">
          <Sparkles size={20} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">ETHEREAL</h1>
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Precision Tally</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
          onClick={() => {
            const themes: Theme[] = ['system', 'light', 'dark'];
            const next = themes[(themes.indexOf(theme) + 1) % themes.length];
            setTheme(next);
          }}
          className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <Icon size={18} />
        </button>
        <button 
          onClick={onOpenCommand}
          className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <Command size={20} />
        </button>
        <button 
          onClick={onOpenNewCounter}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm spring-shadow hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-300 hover:translate-y-[-2px]"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Create</span>
        </button>
      </div>
    </header>
  );
};

const AppContent = () => {
  const { 
    counters, 
    addCounter, 
    updateCounter, 
    incrementCounter, 
    decrementCounter,
    deleteCounter,
    clearAllData,
    resetCounter,
    saveSession
  } = useCounters();
  
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNewCounterOpen, setIsNewCounterOpen] = useState(false);
  
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('ethereal_theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('ethereal_theme', theme);
    const applyTheme = (isDark: boolean) => {
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen pt-24 pb-32 max-w-5xl mx-auto px-6 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Header 
        onOpenNewCounter={() => setIsNewCounterOpen(true)} 
        onOpenCommand={() => setIsCommandOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard counters={counters} />} />
          <Route path="/counters" element={<CounterList counters={counters} onIncrement={incrementCounter} onDecrement={decrementCounter} />} />
          <Route 
            path="/counter/:id" 
            element={
              <CounterDetail 
                counters={counters} 
                onIncrement={incrementCounter} 
                onDecrement={decrementCounter} 
                onReset={resetCounter} 
                onUpdate={updateCounter} 
                onDelete={deleteCounter} 
                onSaveSession={saveSession}
              />
            } 
          />
          <Route path="/history" element={<HistoryView counters={counters} />} />
          <Route path="/settings" element={<SettingsView counters={counters} onClearData={clearAllData} />} />
        </Routes>
      </AnimatePresence>

      <Navigation />

      <AnimatePresence>
        {isCommandOpen && <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} counters={counters} />}
        {isNewCounterOpen && (
          <CounterModal 
            isOpen={isNewCounterOpen} 
            onClose={() => setIsNewCounterOpen(false)}
            onSave={(counter) => {
              addCounter(counter);
              setIsNewCounterOpen(false);
            }}
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
