import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trash2, 
  Settings2,
  ChevronUp,
  ChevronDown,
  Sparkles
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

const Confetti = ({ count }: { count: number }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={`${count}-${i}`}
        initial={{ y: -20, x: Math.random() * 400 - 200, opacity: 1, scale: 1 }}
        animate={{ y: 600, x: Math.random() * 600 - 300, opacity: 0, scale: 0.5, rotate: 360 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-0 left-1/2 w-3 h-3 rounded-full"
        style={{ backgroundColor: ['#FFD700', '#FF6347', '#00BFFF', '#7CFC00'][i % 4] }}
      />
    ))}
  </div>
);

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
  const [celebrate, setCelebrate] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const counter = (counters || []).find(c => c.id === id);

  useEffect(() => {
    if (counter?.id) {
      onStartSession(counter.id);
    }
    return () => {
      if (counter?.id) onEndSession(counter.id);
    };
  }, [id, onStartSession, onEndSession]);

  useEffect(() => {
    if (counter?.activeSessionId) {
      const session = (counter.sessions || []).find(s => s.id === counter.activeSessionId);
      if (session) {
        setSessionTime(Math.floor((Date.now() - session.startTime) / 1000));
        timerRef.current = window.setInterval(() => {
          setSessionTime(Math.floor((Date.now() - session.startTime) / 1000));
        }, 1000);
      }
    } else {
      setSessionTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [counter?.activeSessionId, counter?.sessions, id]);

  if (!counter) return <div className="dark:text-white text-center py-20">Tally not found.</div>;

  const progress = counter.goal ? (counter.count / counter.goal) * 100 : 0;
  
  useEffect(() => {
    if (counter.goal && counter.count === counter.goal) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 3000);
    }
  }, [counter.count, counter.goal]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        onIncrement(counter.id);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        onDecrement(counter.id);
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [counter.id, onIncrement, onDecrement]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = () => {
    if (window.confirm('Permanently delete this counter and all sessions?')) {
      onDelete(counter.id);
      navigate('/counters');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="min-h-[80vh] flex flex-col items-center justify-center relative select-none"
    >
      {celebrate && <Confetti count={counter.count} />}

      <div className="absolute top-0 w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/counters')}
            className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{counter.name}</h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{counter.category}</p>
          </div>
        </div>

        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-indigo-600 dark:bg-indigo-500 px-6 py-2 rounded-full flex items-center gap-3 spring-shadow border-2 border-white/20"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
          <span className="text-sm font-mono font-black text-white tracking-wider uppercase">Live {formatTime(sessionTime)}</span>
        </motion.div>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsEditOpen(true)}
             className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
           >
             <Settings2 size={20} />
           </button>
           <button 
             onClick={handleDelete}
             className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all spring-shadow"
           >
             <Trash2 size={20} />
           </button>
        </div>
      </div>

      <div className="w-full max-lg flex flex-col items-center gap-12 text-center mt-8">
        {counter.goal && (
          <div className="w-full glass h-5 rounded-full overflow-hidden relative border-none">
            <motion.div 
              className="absolute left-0 top-0 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              style={{ backgroundColor: counter.color }}
            />
          </div>
        )}

        <div className="relative">
          <motion.div
            key={counter.count}
            initial={{ scale: 0.8, opacity: 0.4, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 12 }}
            className="text-[140px] sm:text-[220px] font-black tracking-tighter text-slate-900 dark:text-white leading-none drop-shadow-2xl"
          >
            {counter.count}
          </motion.div>
          {counter.goal && (
            <div className="mt-4 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3">
              Target: <span className="text-slate-900 dark:text-white font-black">{counter.goal}</span>
              {progress >= 100 && <Sparkles size={16} className="text-yellow-500 animate-bounce" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 w-full">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={() => onDecrement(counter.id)}
            className="w-24 h-24 glass rounded-[36px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <ChevronDown size={40} />
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.92, y: 4 }}
            onClick={() => onIncrement(counter.id)}
            className="flex-1 h-36 rounded-[48px] text-white flex items-center justify-center gap-4 text-5xl font-black spring-shadow hover:scale-[1.03] transition-all"
            style={{ backgroundColor: counter.color }}
          >
            <ChevronUp size={56} />
          </motion.button>

          <motion.button 
             whileTap={{ scale: 0.8 }}
             onClick={() => {
               if(window.confirm('Reset current count to zero?')) onReset(counter.id);
             }}
             className="w-24 h-24 glass rounded-[36px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <RotateCcw size={40} />
          </motion.button>
        </div>

        <div className="flex gap-4 w-full">
          {[10, 100].map(val => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.95 }}
              onClick={() => onIncrement(counter.id, val)}
              className="flex-1 py-6 rounded-3xl glass text-slate-900 dark:text-white font-black text-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              +{val}
            </motion.button>
          ))}
        </div>
      </div>
      
      <p className="mt-16 text-slate-300 dark:text-slate-700 text-[11px] font-black tracking-[0.3em] uppercase">
        Tap button or hit <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs mx-1">SPACE</span>
      </p>

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