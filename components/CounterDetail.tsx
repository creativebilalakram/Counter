
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trash2, 
  Settings2,
  ChevronUp,
  ChevronDown,
  Timer,
  TimerOff,
  Sparkles
} from 'lucide-react';
import { Counter } from '../types';
import CounterModal from './CounterModal';

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

const Confetti = ({ count }: { count: number }) => {
  return (
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
};

const CounterDetail: React.FC<CounterDetailProps> = ({ 
  counters, 
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

  const counter = counters.find(c => c.id === id);

  useEffect(() => {
    if (counter?.activeSessionId) {
      const session = counter.sessions.find(s => s.id === counter.activeSessionId);
      if (session) {
        timerRef.current = window.setInterval(() => {
          setSessionTime(Math.floor((Date.now() - session.startTime) / 1000));
        }, 1000);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [counter?.activeSessionId, counter?.sessions]);

  if (!counter) return <div className="dark:text-white text-center py-20">Counter not found</div>;

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
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="min-h-[80vh] flex flex-col items-center justify-center relative select-none"
    >
      {celebrate && <Confetti count={counter.count} />}

      <div className="absolute top-0 left-0 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{counter.name}</h2>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{counter.category}</p>
        </div>
      </div>

      <div className="absolute top-0 right-0 flex items-center gap-2">
         {counter.activeSessionId ? (
           <motion.button 
             initial={{ scale: 0 }} animate={{ scale: 1 }}
             onClick={() => onEndSession(counter.id)}
             className="px-4 h-10 rounded-xl bg-red-500 text-white flex items-center gap-2 font-bold text-sm spring-shadow"
           >
             <TimerOff size={16} /> Stop {formatTime(sessionTime)}
           </motion.button>
         ) : (
           <button 
             onClick={() => onStartSession(counter.id)}
             className="px-4 h-10 rounded-xl glass flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-bold"
           >
             <Timer size={16} /> Start Session
           </button>
         )}
         <button 
           onClick={() => setIsEditOpen(true)}
           className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
         >
           <Settings2 size={18} />
         </button>
         <button 
           onClick={() => {
             if (confirm('Delete this counter and all its history?')) {
                onDelete(counter.id);
                navigate('/counters');
             }
           }}
           className="w-10 h-10 rounded-xl glass flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
         >
           <Trash2 size={18} />
         </button>
      </div>

      <div className="w-full max-w-lg flex flex-col items-center gap-12 text-center">
        {counter.goal && (
          <div className="w-full glass h-4 rounded-full overflow-hidden relative border-none">
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
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="text-[140px] sm:text-[180px] font-black tracking-tighter text-slate-900 dark:text-white leading-none drop-shadow-2xl"
          >
            {counter.count}
          </motion.div>
          {counter.goal && (
            <div className="mt-4 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              Goal: <span className="text-slate-900 dark:text-white">{counter.goal}</span>
              {progress >= 100 && <Sparkles size={14} className="text-yellow-500" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 w-full">
          <motion.button 
            whileTap={{ scale: 0.85 }}
            onClick={() => onDecrement(counter.id)}
            className="w-24 h-24 glass rounded-[36px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-105 transition-all duration-300"
          >
            <ChevronDown size={32} />
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.94, y: 4 }}
            onClick={() => onIncrement(counter.id)}
            className="flex-1 h-32 rounded-[48px] text-white flex items-center justify-center gap-4 text-4xl font-black spring-shadow hover:scale-[1.02] transition-all duration-300"
            style={{ backgroundColor: counter.color }}
          >
            <ChevronUp size={48} />
          </motion.button>

          <motion.button 
             whileTap={{ scale: 0.85 }}
             onClick={() => {
               if(confirm('Reset count to zero? Logs will be preserved.')) onReset(counter.id);
             }}
             className="w-24 h-24 glass rounded-[36px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-105 transition-all duration-300"
          >
            <RotateCcw size={32} />
          </motion.button>
        </div>

        <div className="flex gap-4 w-full">
          {[10, 100].map(val => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.95 }}
              onClick={() => onIncrement(counter.id, val)}
              className="flex-1 py-5 rounded-3xl glass text-slate-600 dark:text-slate-300 font-black text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              +{val}
            </motion.button>
          ))}
        </div>
      </div>
      
      <p className="mt-16 text-slate-300 dark:text-slate-600 text-[10px] font-black tracking-[0.2em] uppercase">
        PRESS <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs mx-1">SPACE</span> TO TALLY
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
