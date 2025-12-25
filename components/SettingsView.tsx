import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Trash2, 
  Sun, 
  Moon, 
  Monitor, 
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  Volume2,
  BarChart,
  ShieldCheck,
  Globe,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Counter, Theme } from '../types.ts';

interface SettingsViewProps {
  counters: Counter[];
  onImport: (data: string) => boolean;
  onClear: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const SettingsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <h3 className="px-6 text-[10px] font-mono font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
      {title}
    </h3>
    <div className="glass rounded-[40px] overflow-hidden premium-shadow border border-white/10">
      {children}
    </div>
  </motion.div>
);

const SettingsItem: React.FC<{ 
  icon: React.ElementType, 
  label: string, 
  description?: string, 
  onClick?: () => void, 
  rightElement?: React.ReactNode,
  danger?: boolean,
  last?: boolean
}> = ({ icon: Icon, label, description, onClick, rightElement, danger, last }) => (
  <button 
    onClick={onClick}
    disabled={!onClick}
    className={`w-full flex items-center justify-between p-6 text-left transition-all relative ${
      onClick ? 'hover:bg-white/40 dark:hover:bg-slate-800/40 active:scale-[0.99]' : 'cursor-default'
    } ${!last ? 'border-b border-slate-100/50 dark:border-slate-800/50' : ''}`}
  >
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
        danger ? 'bg-red-500/10 text-red-500' : 'bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-300'
      }`}>
        <Icon size={20} />
      </div>
      <div>
        <p className={`font-bold text-lg leading-tight ${danger ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
          {label}
        </p>
        {description && <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {rightElement}
      {onClick && !rightElement && <ChevronRight size={18} className="text-slate-300 dark:text-slate-700" />}
    </div>
  </button>
);

const Toggle = ({ active }: { active: boolean }) => (
  <div className={`w-11 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${
    active ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
  }`}>
    <motion.div 
      animate={{ x: active ? 20 : 0 }}
      className="w-4 h-4 bg-white rounded-full shadow-sm"
    />
  </div>
);

const SettingsView: React.FC<SettingsViewProps> = ({ counters, onImport, onClear, theme, setTheme }) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeToggles, setActiveToggles] = useState({
    effects: true,
    haptics: true,
    sounds: false,
    analytics: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(counters, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ethereal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImport(content);
      setImportStatus(success ? 'success' : 'error');
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-32 max-w-2xl mx-auto"
    >
      <header className="flex flex-col gap-2 px-2">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">System</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Personalize your tally environment.</p>
      </header>

      {/* Interface Section */}
      <SettingsSection title="Interface & Experience">
        <div className="p-6 grid grid-cols-3 gap-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          {(['system', 'light', 'dark'] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] transition-all relative overflow-hidden ${
                theme === t 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 premium-shadow' 
                  : 'glass text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {t === 'system' && <Monitor size={20} />}
              {t === 'light' && <Sun size={20} />}
              {t === 'dark' && <Moon size={20} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
            </button>
          ))}
        </div>
        <SettingsItem 
          icon={Sparkles} 
          label="Visual Effects" 
          description="Hardware-accelerated animations & particles"
          onClick={() => setActiveToggles(p => ({...p, effects: !p.effects}))}
          rightElement={<Toggle active={activeToggles.effects} />}
        />
        <SettingsItem 
          icon={Zap} 
          label="Physicality" 
          description="Simulated inertia and bounce on tap"
          onClick={() => setActiveToggles(p => ({...p, haptics: !p.haptics}))}
          rightElement={<Toggle active={activeToggles.haptics} />}
        />
        <SettingsItem 
          icon={Volume2} 
          label="Soundscapes" 
          description="Minimalist auditory feedback (Coming Soon)"
          onClick={() => setActiveToggles(p => ({...p, sounds: !p.sounds}))}
          rightElement={<Toggle active={activeToggles.sounds} />}
          last
        />
      </SettingsSection>

      {/* Intelligence Section */}
      <SettingsSection title="Intelligence">
        <SettingsItem 
          icon={BarChart} 
          label="Advanced Analytics" 
          description="Detailed heatmaps and session trends"
          onClick={() => setActiveToggles(p => ({...p, analytics: !p.analytics}))}
          rightElement={<Toggle active={activeToggles.analytics} />}
        />
        <SettingsItem 
          icon={Eye} 
          label="Privacy Shield" 
          description="Hide counts on the dashboard by default"
          last
        />
      </SettingsSection>

      {/* Data Section */}
      <SettingsSection title="Vault & Migration">
        <SettingsItem 
          icon={Download} 
          label="Export Vault" 
          description="Portable Ethereal archive (.json)"
          onClick={handleExport}
        />
        <div className="relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          <SettingsItem 
            icon={Upload} 
            label="Restore Archive" 
            description="Overwrite current data with a backup"
            onClick={handleImportClick}
            rightElement={
              <AnimatePresence mode="wait">
                {importStatus === 'success' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-green-500">
                    <CheckCircle2 size={24} />
                  </motion.div>
                )}
                {importStatus === 'error' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-red-500">
                    <AlertCircle size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            }
          />
        </div>
        <SettingsItem 
          icon={Trash2} 
          label="Purge Environment" 
          description="Complete wipe of all local records"
          danger
          last
          onClick={() => {
            if(confirm('🚨 CRITICAL ACTION: This will permanently delete ALL tallies and history. Proceed?')) {
              onClear();
              window.location.hash = '/';
            }
          }}
        />
      </SettingsSection>

      {/* Branding & Signature */}
      <div className="pt-8 space-y-12">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass rounded-[48px] p-10 flex flex-col items-center gap-6 relative overflow-hidden group border border-indigo-500/10"
        >
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="w-20 h-20 rounded-[32px] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 premium-shadow">
            <Sparkles size={32} />
          </div>

          <div className="text-center space-y-2 relative z-10">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Ethereal Tally</h2>
              <div className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest">PRO</div>
            </div>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-[0.4em]">Designed & Engineered by</p>
            <p className="text-xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient tracking-tight">
              Creative Bilal Agency
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <a 
              href="https://creativebilal.com/Portfolio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl glass text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
            >
              <Globe size={14} /> View Portfolio
            </a>
            <a 
              href="https://creativebilal.com/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl glass text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all"
            >
              <MessageSquare size={14} /> Contact Us
            </a>
          </div>

          <div className="pt-8 flex items-center gap-2 text-slate-300 dark:text-slate-700">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">End-to-End Local Privacy Guaranteed</span>
          </div>
        </motion.div>

        <div className="text-center">
          <p className="text-[9px] font-mono font-bold text-slate-300 dark:text-slate-800 uppercase tracking-[0.5em]">
            Build 24A.512 • Stable Channel • Made with Love
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default SettingsView;