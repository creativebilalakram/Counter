import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trash2, 
  Settings2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { Counter } from '../types.ts';
import CounterModal from './CounterModal.tsx';

interface CounterDetailProps {
  counters: Counter[];
  onIncrement: (id: string, amount?: number) => void;
  onDecrement: (id: string, amount?: number) => void;
  onReset: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onStartSession: (id: string) => void;
  onEndSession: (id: string) => void;
}

const Particle: React.FC<{ color: string }> = ({ color }) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * 250 + 50;
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ 
        x: Math.cos(angle) * distance, 
        y: Math.sin(angle) * distance, 
        opacity: 0, 
        scale: 0 
      }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
    />
  );
};

const CounterDetail: React.FC<CounterDetailProps> = ({ 
  counters = [], 
  onIncrement, 
  onDecrement, 
  onReset,
  onUpdate,
  onDelete,
  onStartSession,
  onEndSession
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const mainControls = useAnimation();

  const counter = counters.find(c => c.id === id);

  useEffect(() => {
    if (counter?.id) onStartSession(counter.id);
    return () => { if (counter?.id) onEndSession(counter.id); };
  }, [id]);

  useEffect(() => {
    if (counter?.activeSessionId) {
      const session = counter.sessions.find(s => s.id === counter.activeSessionId);
      if (session) {
        setSessionTime(Math.floor((Date.now() - session.startTime) / 1000));
        timerRef.current = window.setInterval(() => {
          setSessionTime(Math.floor((Date.now() - session.startTime) / 1000));
        }, 1000);
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [counter?.activeSessionId]);

  if (!counter) return null;

  const progress = counter.goal ? (counter.count / counter.goal) * 100 : 0;
  const isGoalReached = counter.goal && counter.count >= counter.goal;

  const handleAction = (type: 'inc' | 'dec' | 'reset', amount: number = 1) => {
    if (type === 'inc') {
      onIncrement(counter.id, amount);
      setClickCount(prev => prev + 1);
      mainControls.start({
        scale: [1, 1.05, 0.98, 1],
        rotate: [0, amount > 1 ? 1 : 0, 0],
        transition: { duration: 0.3, ease: "easeOut" }
      });
    } else if (type === 'dec') {
      onDecrement(counter.id, amount);
      mainControls.start({ y: [0, 5, 0], transition: { duration: 0.2 } });
    } else {
      if (confirm('Reset tally?')) onReset(counter.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative max-w-2xl mx-auto min-h-[80vh] flex flex-col pt-4"
    >
      {/* Editorial Header */}
      <header className="flex items-center justify-between mb-20 px-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/counters')}
          className="w-14 h-14 rounded-full glass flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all premium-shadow"
        >
          <ArrowLeft size={22} />
        </motion.button>
        
        <div className="text-center">
          <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-slate-400 dark:text-slate-500 mb-1">{counter.category}</h2>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{counter.name}</h1>
        </div>

        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsEditOpen(true)}
          className="w-14 h-14 rounded-full glass flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all premium-shadow"
        >
          <Settings2 size={22} />
        </motion.button>
      </header>

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence>
          {isGoalReached && (
            <motion.div 
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              className="absolute -top-16 px-6 py-2 rounded-full bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_10px_30px_rgba(99,102,241,0.4)]"
            >
              <Sparkles size={14} /> Peak Achievement
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
           <motion.div
             key={counter.count}
             initial={{ y: 40, opacity: 0, rotateX: 45 }}
             animate={{ y: 0, opacity: 1, rotateX: 0 }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
             className="text-[180px] md:text-[240px] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.8] cursor-default select-none"
             style={{ perspective: '1000px' }}
           >
             {counter.count}
           </motion.div>
           
           <div className="absolute -inset-10 bg-indigo-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </div>

        {counter.goal && (
          <div className="mt-8 flex flex-col items-center gap-4 w-full px-12">
            <div className="flex justify-between w-full text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
              <span>Progress</span>
              <span>{Math.round(progress)}% / {counter.goal}</span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: counter.color, boxShadow: `0 0 15px ${counter.color}66` }}
               />
            </div>
          </div>
        )}
      </div>

      {/* Spatial Interactions */}
      <div className="mt-auto pb-12 px-6 flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={() => handleAction('dec')}
            className="w-20 h-20 rounded-[30px] glass flex items-center justify-center text-slate-400 hover:text-red-500 transition-all active:bg-red-500/5"
          >
            <ChevronDown size={32} />
          </motion.button>

          <div className="flex-1 relative">
            <AnimatePresence>
              {Array.from({ length: 6 }).map((_, i) => (
                clickCount > 0 && <Particle key={`${clickCount}-${i}`} color={counter.color} />
              ))}
            </AnimatePresence>
            
            <motion.button 
              animate={mainControls}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96, y: 2 }}
              onClick={() => handleAction('inc')}
              className="w-full h-32 rounded-[48px] omni-button-glow flex flex-col items-center justify-center gap-1 relative overflow-hidden group"
              style={{ backgroundColor: counter.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/20 opacity-40" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ChevronUp size={48} className="text-white drop-shadow-2xl relative z-10" />
              <span className="text-[10px] font-mono font-black text-white/50 uppercase tracking-[0.4em] relative z-10">Tally</span>
            </motion.button>
          </div>

          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={() => handleAction('reset')}
            className="w-20 h-20 rounded-[30px] glass flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all active:bg-indigo-500/5"
          >
            <RotateCcw size={28} />
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[10, 100].map(val => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAction('inc', val)}
              className="py-6 rounded-[32px] glass text-slate-900 dark:text-white font-black text-xl hover:bg-white dark:hover:bg-slate-800 transition-all premium-shadow flex items-center justify-center gap-2 group"
            >
              <span className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors">+</span>{val}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-10 opacity-30">
           <div className="flex items-center gap-2">
             <Activity size={12} />
             <span className="text-[10px] font-mono uppercase tracking-widest">{formatTime(sessionTime)}</span>
           </div>
           <div className="flex items-center gap-2">
             <Layers size={12} />
             <span className="text-[10px] font-mono uppercase tracking-widest">Active Focus</span>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditOpen && (
          <CounterModal 
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSave={(updates) => {
              onUpdate(counter.id, updates);
              setIsEditOpen(false);
            }}
            initialData={counter}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CounterDetail;