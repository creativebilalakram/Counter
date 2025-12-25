import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Counter } from '../types.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  counters: Counter[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, counters = [] }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query) return [];
    return (counters || [])
      .filter(c => (c.name || '').toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, counters]);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        className="relative w-full max-w-2xl glass bg-white dark:bg-slate-900 rounded-[32px] spring-shadow overflow-hidden"
      >
        <div className="flex items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <Search size={24} className="text-slate-400 dark:text-slate-600 mr-4" />
          <input 
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search counters, actions, or settings..."
            className="w-full text-xl font-medium focus:outline-none text-slate-900 dark:text-white bg-transparent placeholder-slate-300 dark:placeholder-slate-700"
          />
          <div className="flex items-center gap-1 glass px-2 py-1 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 font-bold opacity-30">
            <Command size={10} /> <span>K</span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
          {results.length > 0 ? (
            results.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  navigate(`/counter/${c.id}`);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <Hash size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 uppercase tracking-widest font-semibold">{c.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-slate-900 dark:text-white">{c.count || 0}</span>
                  <ArrowRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </div>
              </button>
            ))
          ) : query ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-600 font-medium">
               No results found for "{query}"
            </div>
          ) : (
            <div className="p-4 space-y-4">
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-2">Recent Counters</p>
               {(counters || []).slice(0, 3).map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate(`/counter/${c.id}`);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Hash size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600">{c.category}</p>
                    </div>
                  </button>
               ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CommandPalette;