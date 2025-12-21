
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trash2, 
  Share, 
  Settings2,
  Volume2,
  ChevronUp,
  ChevronDown,
  Timer
} from 'lucide-react';
import { Counter, CounterSession } from '../types';
import CounterModal from './CounterModal';

interface CounterDetailProps {
  counters: Counter[];
  onIncrement: (id: string, amount?: number) => void;
  onDecrement: (id: string, amount?: number) => void;
  onReset: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onSaveSession: (id: string, session: CounterSession) => void;
}

const CounterDetail: React.FC<CounterDetailProps> = ({ 
  counters, 
  onIncrement, 
  onDecrement, 
  onReset,
  onUpdate,
  onDelete,
  onSaveSession
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const counter = counters.find(c => c.id === id);
  
  // Timer State
  const [elapsed, setElapsed] = useState(0);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const initialValueRef = useRef<number>(counter?.count || 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
      // Smart Session Save on Unmount
      if (counter) {
        onSaveSession(counter.id, {
          id: crypto.randomUUID(),
          startTime: sessionStartTimeRef.current,
          endTime: Date.now(),
          startValue: initialValueRef.current,
          endValue: counter.count
        });
      }
    };
  }, [id, onSaveSession]); // We intentionally omit counter from deps to prevent re-saves on every click

  if (!counter) return <div className="dark:text-white text-center py-20 font-bold">Counter not found</div>;

  const progress = counter.goal ? (counter.count / counter.goal) * 100 : 0;
  
  // Format seconds to HH:MM:SS
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[75vh] flex flex-col items-center justify-center relative select-none"
    >
      {/* Smart Timer Indicator */}
      <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full glass spring-shadow">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <Timer size={14} className="text-slate-400" />
        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
          Session: {formatTime(elapsed)}
        </span>
      </div>

      <div className="absolute top-0 left-0 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{counter.name}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{counter.category}</p>
        </div>
      </div>

      <div className="absolute top-0 right-0 flex items-center gap-2">
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
           className="w-10 h-10 rounded-xl glass flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
         >
           <Trash2 size={18} />
         </button>
      </div>

      <div className="w-full max-w-lg flex flex-col items-center gap-8 text-center mt-12 sm:mt-0">
        {counter.goal && (
          <div className="w-full glass h-3 rounded-full overflow-hidden relative border-none spring-shadow">
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
            className="text-[140px] sm:text-[180px] font-black tracking-tighter text-slate-900 dark:text-white leading-none drop-shadow-2xl"
          >
            {counter.count}
          </motion.div>
          {counter.goal && (
            <div className="mt-2 text-slate-400 dark:text-slate-500 font-medium tracking-wide">
              TARGET <span className="text-slate-900 dark:text-white font-bold">{counter.goal}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6 w-full">
          <button 
            onClick={() => onDecrement(counter.id)}
            className="w-20 h-20 sm:w-24 sm:h-24 glass rounded-[32px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-105 active:scale-90 transition-all duration-300"
          >
            <ChevronDown size={32} />
          </button>
          
          <button 
            onClick={() => onIncrement(counter.id)}
            className="flex-1 h-28 sm:h-32 rounded-[40px] text-white flex flex-col items-center justify-center gap-1 text-4xl font-black spring-shadow hover:scale-[1.02] active:scale-95 transition-all duration-300"
            style={{ backgroundColor: counter.color }}
          >
            <ChevronUp size={40} />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Count</span>
          </button>

          <button 
             onClick={() => {
               if(confirm('Reset count? Duration history will be kept.')) onReset(counter.id);
             }}
             className="w-20 h-20 sm:w-24 sm:h-24 glass rounded-[32px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-105 active:scale-90 transition-all duration-300"
          >
            <RotateCcw size={32} />
          </button>
        </div>

        <div className="flex gap-3 w-full">
          {[10, 100].map(val => (
            <button
              key={val}
              onClick={() => onIncrement(counter.id, val)}
              className="flex-1 py-4 rounded-2xl glass text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              +{val}
            </button>
          ))}
        </div>
      </div>
      
      <p className="mt-12 text-slate-300 dark:text-slate-600 text-xs font-bold tracking-[0.2em] uppercase">
        SMART TRACKING ACTIVE
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
