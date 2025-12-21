
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Upload,
  Info,
  CheckCircle2
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
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-3 spring-shadow z-50 flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/counters' && location.pathname.startsWith('/counter/'));
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            {isActive && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
};

const SettingsView = ({ onClearData, counters, onImportData }: { onClearData: () => void, counters: Counter[], onImportData: (data: string) => boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(counters));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ethereal_tally_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = onImportData(content);
        setImportStatus(success ? 'success' : 'error');
        setTimeout(() => setImportStatus('idle'), 3000);
      };
      reader.readAsText(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="mb-8 px-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your data and cloud preferences.</p>
      </div>

      <div className="glass rounded-[32px] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        <button 
          onClick={exportData}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Download size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Export Data</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Download a backup of all counters.</p>
            </div>
          </div>
        </button>

        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleFileChange} 
          />
          <button 
            onClick={handleImportClick}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                importStatus === 'success' ? 'bg-green-50 text-green-500' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'
              }`}>
                {importStatus === 'success' ? <CheckCircle2 size={22} /> : <Upload size={22} />}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Import Data</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Restore your counters from a backup file.</p>
              </div>
            </div>
            {importStatus === 'error' && <span className="text-red-500 text-xs font-bold uppercase">Invalid File</span>}
          </button>
        </div>

        <button 
          onClick={onClearData}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-red-50/50 dark:hover:bg-red-500/5 transition-colors group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
              <Trash2 size={22} />
            </div>
            <div>
              <p className="font-bold text-red-600">Reset Application</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Wipe all data and start fresh.</p>
            </div>
          </div>
        </button>

        <div className="px-8 py-6 flex items-center gap-4 opacity-50">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <Info size={22} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">Version 1.2.5 (Pro)</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Build 2024.11.25.premium</p>
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
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">Ethereal</h1>
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Digital Tally</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
          onClick={() => {
            const themes: Theme[] = ['system', 'light', 'dark'];
            const next = themes[(themes.indexOf(theme) + 1) % themes.length];
            setTheme(next);
          }}
          className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900 transition-all duration-300"
        >
          <Icon size={18} />
        </button>
        <button 
          onClick={onOpenCommand}
          className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all duration-300"
        >
          <Command size={20} />
        </button>
        <button 
          onClick={onOpenNewCounter}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium spring-shadow hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 hover:translate-y-[-2px]"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">New Counter</span>
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
    importData,
    resetCounter,
    startSession,
    endSession
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
    <div className="min-h-screen pt-24 pb-32 max-w-5xl mx-auto px-6 overflow-x-hidden">
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
          <Route path="/counter/:id" element={<CounterDetail counters={counters} onIncrement={incrementCounter} onDecrement={decrementCounter} onReset={resetCounter} onUpdate={updateCounter} onDelete={deleteCounter} onStartSession={startSession} onEndSession={endSession} />} />
          <Route path="/history" element={<HistoryView counters={counters} />} />
          <Route path="/settings" element={<SettingsView counters={counters} onClearData={clearAllData} onImportData={importData} />} />
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
