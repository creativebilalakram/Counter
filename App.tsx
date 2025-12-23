
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
  Monitor,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle
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
import { useCounters } from './hooks/useCounters.ts';

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
            {isActive && <span className="text-sm font-bold">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
};

const SettingsView = ({ onClearData, counters, onImportData }: { onClearData: () => void, counters: Counter[], onImportData: (data: string) => boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error' | 'confirming'>('idle');
  const [tempData, setTempData] = useState<string | null>(null);

  const exportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(counters || []));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `ethereal_tally_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (e) {
      console.error("Export failed", e);
    }
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
        setTempData(content);
        setImportStatus('confirming');
      };
      reader.readAsText(file);
    }
  };

  const confirmImport = () => {
    if (tempData) {
      const success = onImportData(tempData);
      setImportStatus(success ? 'success' : 'error');
      setTempData(null);
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="mb-8 px-2 text-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h2>
        <p className="text-slate-500 dark:text-slate-500 text-sm font-medium uppercase tracking-widest mt-1">Workspace & Data</p>
      </div>

      <div className="glass rounded-[32px] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 spring-shadow">
        <button 
          onClick={exportData}
          className="w-full px-8 py-7 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center spring-shadow">
              <Download size={24} />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white tracking-tight">Export Workspace</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Save all tallies to JSON</p>
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
            className="w-full px-8 py-7 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all spring-shadow ${
                importStatus === 'success' ? 'bg-green-500 text-white' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'
              }`}>
                {importStatus === 'success' ? <CheckCircle2 size={24} /> : <Upload size={24} />}
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white tracking-tight">Import Workspace</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Restore from backup</p>
              </div>
            </div>
          </button>
        </div>

        <button 
          onClick={() => {
            if(window.confirm("CRITICAL: This will delete ALL tallies and history forever. Are you sure?")) {
              onClearData();
            }
          }}
          className="w-full px-8 py-7 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center spring-shadow">
              <Trash2 size={24} />
            </div>
            <div>
              <p className="font-black text-red-600 tracking-tight">Reset Application</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Wipe all local data</p>
            </div>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {importStatus === 'confirming' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-12 max-w-md w-full spring-shadow text-center border border-white/20">
              <div className="w-20 h-20 bg-amber-500 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 spring-shadow">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Replace Data?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">This action will overwrite your current counters with the contents of the backup file. This cannot be undone.</p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={confirmImport}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg spring-shadow hover:scale-[1.02] transition-transform"
                >
                  Yes, Overwrite Data
                </button>
                <button 
                  onClick={() => setImportStatus('idle')}
                  className="w-full py-5 glass text-slate-400 font-bold rounded-2xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-5 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto cursor-pointer group" onClick={() => window.location.hash = '/'}>
        <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 spring-shadow group-hover:scale-110 transition-transform duration-500">
          <Sparkles size={24} />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Ethereal</h1>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">Premium Tally</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
          onClick={() => {
            const themes: Theme[] = ['system', 'light', 'dark'];
            const next = themes[(themes.indexOf(theme) + 1) % themes.length];
            setTheme(next);
          }}
          className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all duration-300"
        >
          <Icon size={20} />
        </button>
        <button 
          onClick={onOpenCommand}
          className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all duration-300"
        >
          <Command size={22} />
        </button>
        <button 
          onClick={onOpenNewCounter}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black spring-shadow hover:scale-105 transition-all duration-300 active:scale-95"
        >
          <Plus size={24} />
          <span className="hidden md:inline text-sm">Create Tally</span>
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
    try {
      return (localStorage.getItem('ethereal_theme') as Theme) || 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    try {
      localStorage.setItem('ethereal_theme', theme);
    } catch {}
    
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
    <div className="min-h-screen pt-28 pb-32 max-w-5xl mx-auto px-6 overflow-x-hidden">
      <Header 
        onOpenNewCounter={() => setIsNewCounterOpen(true)} 
        onOpenCommand={() => setIsCommandOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard counters={counters || []} />} />
          <Route path="/counters" element={<CounterList counters={counters || []} onIncrement={incrementCounter} onDecrement={decrementCounter} onDelete={deleteCounter} />} />
          <Route path="/counter/:id" element={<CounterDetail counters={counters || []} onIncrement={incrementCounter} onDecrement={decrementCounter} onReset={resetCounter} onUpdate={updateCounter} onDelete={deleteCounter} onStartSession={startSession} onEndSession={endSession} />} />
          <Route path="/history" element={<HistoryView counters={counters || []} />} />
          <Route path="/settings" element={<SettingsView counters={counters || []} onClearData={clearAllData} onImportData={importData} />} />
        </Routes>
      </AnimatePresence>

      <Navigation />

      <AnimatePresence>
        {isCommandOpen && <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} counters={counters || []} />}
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
