
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { History as HistoryIcon, Zap, Clock, TrendingUp } from 'lucide-react';
import { Counter } from '../types';

interface HistoryViewProps {
  counters: Counter[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ counters }) => {
  const allSessions = useMemo(() => {
    return counters.flatMap(c => 
      c.sessions
        .filter(s => s.endTime) // Only show completed/active tracked sessions
        .map(s => {
          const countInSession = (s.endValue ?? c.count) - s.startValue;
          return {
            ...s,
            counterName: c.name,
            color: c.color,
            countInSession
          };
        })
    ).sort((a, b) => b.startTime - a.startTime);
  }, [counters]);

  const stats = useMemo(() => {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const sessionCount = allSessions.filter(s => s.startTime > last24h).length;
    return { sessionCount };
  }, [allSessions]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '< 1 min';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const h = Math.floor(mins / 60);
    if (h > 0) return `${h}h ${mins % 60}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Activity</h2>
          <p className="text-slate-500 dark:text-slate-400">Your focused sessions and habits.</p>
        </div>
        <div className="glass px-6 py-4 rounded-3xl spring-shadow flex items-center gap-4">
           <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
             <TrendingUp size={20} />
           </div>
           <div>
             <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">24H Frequency</p>
             <p className="text-xl font-black text-slate-900 dark:text-white">{stats.sessionCount} Sessions</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        {allSessions.slice(0, 30).map((session, idx) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass p-6 rounded-[28px] spring-shadow group transition-all relative overflow-hidden"
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5 opacity-40" 
              style={{ backgroundColor: session.color }}
            />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: session.color }}
                >
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{session.counterName}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{format(session.startTime, 'MMM d, h:mm a')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 dark:text-white">+{session.countInSession}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Growth</p>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                 <Clock size={14} className="opacity-50" />
                 <span className="text-xs font-bold">{formatDuration(session.duration)}</span>
               </div>
               <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                 <TrendingUp size={14} className="opacity-50" />
                 <span className="text-xs font-bold">
                   {session.duration ? (session.countInSession / (session.duration / 60)).toFixed(1) : session.countInSession} 
                   <span className="opacity-40 ml-1">cts/min</span>
                 </span>
               </div>
            </div>
          </motion.div>
        ))}

        {allSessions.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center glass rounded-[40px] border-dashed border-2 border-slate-200 dark:border-slate-800">
            <HistoryIcon size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-medium">No sessions recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
