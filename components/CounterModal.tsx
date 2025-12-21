
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Target, Hash, LayoutGrid, Palette } from 'lucide-react';

const PRESET_COLORS = [
  '#0F172A', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#EC4899'
];

const CATEGORIES = ['General', 'Health', 'Work', 'Personal', 'Fitness', 'Learning'];

interface CounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (counter: any) => void;
  initialData?: any;
}

const CounterModal: React.FC<CounterModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [goal, setGoal] = useState(initialData?.goal?.toString() || '');
  const [color, setColor] = useState(initialData?.color || PRESET_COLORS[0]);
  const [category, setCategory] = useState(initialData?.category || CATEGORIES[0]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setGoal(initialData.goal?.toString() || '');
      setColor(initialData.color);
      setCategory(initialData.category);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      goal: goal ? parseInt(goal) : undefined,
      color,
      category,
    });
    if (!initialData) {
      setName('');
      setGoal('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg glass bg-white dark:bg-slate-900 rounded-[40px] spring-shadow overflow-hidden p-10"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-2xl glass flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={20} />
        </button>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
          {initialData ? 'Update Tally' : 'New Tally'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <Hash size={14} /> Name
            </label>
            <input 
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="E.g. Daily Water Glasses"
              className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl px-6 py-4 text-lg font-semibold focus:outline-none focus:ring-2 ring-slate-200 dark:ring-slate-700 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <Target size={14} /> Goal
              </label>
              <input 
                type="number"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl px-6 py-4 text-lg font-semibold focus:outline-none focus:ring-2 ring-slate-200 dark:ring-slate-700 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <LayoutGrid size={14} /> Group
              </label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 dark:text-white rounded-2xl px-6 py-4 text-lg font-semibold focus:outline-none focus:ring-2 ring-slate-200 dark:ring-slate-700 transition-all appearance-none"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <Palette size={14} /> Theme
            </label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-2xl transition-all ${color === c ? 'scale-110 ring-4 ring-slate-100 dark:ring-slate-700 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105 opacity-60'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-3xl font-black text-xl spring-shadow hover:bg-slate-800 dark:hover:bg-slate-200 transition-all transform hover:-translate-y-1"
          >
            {initialData ? 'Confirm Changes' : 'Launch Tally'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CounterModal;
