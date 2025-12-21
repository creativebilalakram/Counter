
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { History as HistoryIcon, ArrowUpRight, ArrowDownRight, RefreshCcw, Zap } from 'lucide-react';
import { Counter } from '../types';

interface HistoryViewProps {
  counters: Counter[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ counters }) => {
  const allLogs = useMemo(() => {
    return counters.flatMap(c => 
      c.logs.map(l => ({ ...l, counterName: c.name, color: c.color }))
    ).sort((a, b) => b.timestamp - a.timestamp);
  }, [counters]);

  const stats = useMemo(() => {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const count24h = allLogs.filter(l => l.timestamp > last24h && l.increment > 0).length;
    return { count24h };
  }, [allLogs]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Activity Log</h2>
          <p className="text-slate-500 dark:text-slate-400">Every interaction accounted for.</p>
        </div>
        <div className="glass px-6 py-4 rounded-3xl spring-shadow flex items-center gap-4">
           <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
             <Zap size={20} />
           </div>
           <div>
             <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">24H Velocity</p>
             <p className="text-xl font-black text-slate-900 dark:text-white">{stats.count24h}</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {allLogs.slice(0, 50).map((log, idx) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass p-5 rounded-[24px] spring-shadow flex items-center justify-between group hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white spring-shadow`}
                style={{ backgroundColor: log.color }}
              >
                {log.increment > 0 ? <ArrowUpRight size={20} /> : log.increment < 0 ? <ArrowDownRight size={20} /> : <RefreshCcw size={20} />}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{log.counterName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{format(log.timestamp, 'MMM d, h:mm a')}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-black ${log.increment > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {log.increment > 0 ? `+${log.increment}` : log.increment}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase font-bold tracking-widest">To {log.newValue}</p>
            </div>
          </motion.div>
        ))}

        {allLogs.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center glass rounded-[40px] border-dashed border-2 border-slate-200 dark:border-slate-800">
            <HistoryIcon size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-medium">Your story begins here. Tap a counter to see it logged.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
