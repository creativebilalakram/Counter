
import React, { useState, useEffect } from 'react';
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
  ChevronDown
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
}

const CounterDetail: React.FC<CounterDetailProps> = ({ 
  counters, 
  onIncrement, 
  onDecrement, 
  onReset,
  onUpdate,
  onDelete
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const counter = counters.find(c => c.id === id);

  if (!counter) return <div className="dark:text-white text-center py-20">Counter not found</div>;

  const progress = counter.goal ? (counter.count / counter.goal) * 100 : 0;
  const springCount = useSpring(counter.count, { stiffness: 100, damping: 20 });
  
  useEffect(() => {
    springCount.set(counter.count);
  }, [counter.count, springCount]);

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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="min-h-[80vh] flex flex-col items-center justify-center relative select-none"
    >
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
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="text-[160px] font-black tracking-tighter text-slate-900 dark:text-white leading-none drop-shadow-xl"
          >
            {counter.count}
          </motion.div>
          {counter.goal && (
            <div className="mt-4 text-slate-400 dark:text-slate-500 font-medium">
              Goal: <span className="text-slate-900 dark:text-white font-bold">{counter.goal}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 w-full">
          <button 
            onClick={() => onDecrement(counter.id)}
            className="w-24 h-24 glass rounded-[36px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-105 active:scale-90 transition-all duration-300"
          >
            <ChevronDown size={32} />
          </button>
          
          <button 
            onClick={() => onIncrement(counter.id)}
            className="flex-1 h-32 rounded-[48px] text-white flex items-center justify-center gap-4 text-3xl font-black spring-shadow hover:scale-[1.02] active:scale-95 transition-all duration-300"
            style={{ backgroundColor: counter.color }}
          >
            <ChevronUp size={48} />
          </button>

          <button 
             onClick={() => {
               if(confirm('Reset count to zero? Logs will be preserved.')) onReset(counter.id);
             }}
             className="w-24 h-24 glass rounded-[36px] flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-105 active:scale-90 transition-all duration-300"
          >
            <RotateCcw size={32} />
          </button>
        </div>

        <div className="flex gap-4 w-full">
          {[10, 100].map(val => (
            <button
              key={val}
              onClick={() => onIncrement(counter.id, val)}
              className="flex-1 py-4 rounded-3xl glass text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              +{val}
            </button>
          ))}
        </div>
      </div>
      
      <p className="mt-12 text-slate-300 dark:text-slate-600 text-sm font-medium tracking-wide">
        PRESS <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs">SPACE</span> TO INCREMENT
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
