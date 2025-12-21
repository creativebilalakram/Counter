
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Hash } from 'lucide-react';
import { Counter } from '../types';

interface CounterCardProps {
  counter: Counter;
  onIncrement: () => void;
  onDecrement: () => void;
  onClick: () => void;
}

const CounterCard: React.FC<CounterCardProps> = ({ 
  counter, 
  onIncrement, 
  onDecrement,
  onClick
}) => {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass rounded-[32px] p-6 spring-shadow relative group overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div 
        className="absolute top-0 right-0 w-24 h-24 blur-[80px] opacity-20 -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150"
        style={{ backgroundColor: counter.color }}
      />

      <div className="flex items-start justify-between mb-8">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white spring-shadow"
          style={{ backgroundColor: counter.color }}
        >
          <Hash size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{counter.category}</span>
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate mb-1">{counter.name}</h3>
        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
          {counter.count.toLocaleString()}
        </p>
      </div>

      <div className="flex gap-2 relative z-10" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onDecrement}
          className="flex-1 py-3 rounded-2xl glass hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all"
        >
          -1
        </button>
        <button 
          onClick={onIncrement}
          className="flex-[2] py-3 rounded-2xl text-white font-bold transition-all spring-shadow active:scale-95"
          style={{ backgroundColor: counter.color }}
        >
          +1
        </button>
      </div>
    </motion.div>
  );
};

interface CounterListProps {
  counters: Counter[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

const CounterList: React.FC<CounterListProps> = ({ counters, onIncrement, onDecrement }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'health' | 'work' | 'personal'>('all');

  const filteredCounters = counters.filter(c => {
    if (c.isArchived) return false;
    if (activeTab === 'all') return true;
    return c.category.toLowerCase() === activeTab;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {['all', 'health', 'work', 'personal'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2 rounded-2xl text-sm font-semibold capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 spring-shadow' 
                  : 'glass text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCounters.map(counter => (
            <CounterCard 
              key={counter.id} 
              counter={counter} 
              onIncrement={() => onIncrement(counter.id)}
              onDecrement={() => onDecrement(counter.id)}
              onClick={() => navigate(`/counter/${counter.id}`)}
            />
          ))}
        </AnimatePresence>
        
        {filteredCounters.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass rounded-[40px] border-dashed border-2 border-slate-200 dark:border-slate-800">
            <Plus size={40} className="text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-medium">No counters in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterList;
