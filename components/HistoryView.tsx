
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInSeconds } from 'date-fns';
import { History as HistoryIcon, Clock, Zap, ArrowRight, Activity } from 'lucide-react';
import { Counter } from '../types';

interface HistoryViewProps {
  counters: Counter[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ counters }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'sessions'>('events');

  const allLogs = useMemo(() => {
    return counters.flatMap(c => 
      c.logs.map(l => ({ ...l, counterName: c.name, color: c.color }))
    ).sort((a, b) => b.timestamp - a.timestamp);
  }, [counters]);

  const allSessions = useMemo(() => {
    return counters.flatMap(c => 
      (c.sessions || []).map(s => ({ ...s, counterName: c.name, color: c.color }))
    ).sort((a, b) => b.startTime - a.startTime);
  }, [counters]);

  const stats = useMemo(() => {
    const totalSec = allSessions.reduce((acc, s) => acc + (s.endTime ? (s.endTime - s.startTime) / 1000 : 0), 0);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return { hours, mins, totalSessions: allSessions.length };
  }, [allSessions]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Insights from your sessions.</p>
        </div>
        <div className="glass px-6 py-4 rounded-[24px] spring-shadow flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
             <Clock size={24} />
           </div>
           <div>
             <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Total Focus</p>
             <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
               {stats.hours}h {stats.mins}m
             </p>
           </div>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 glass rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('events')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'events' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 spring-shadow' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Activity
        </button>
        <button 
          onClick={() => setActiveTab('sessions')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'sessions' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 spring-shadow' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Sessions
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'events' ? (
          <motion.div 
            key="events"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3"
          >
            {allLogs.slice(0, 40).map((log) => (
              <div key={log.id} className="glass p-4 rounded-2xl flex items-center justify-between group hover:translate-x-1 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: log.color }} />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{log.counterName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{format(log.timestamp, 'MMM d, h:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-black ${log.increment > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {log.increment > 0 ? `+${log.increment}` : log.increment}
                  </span>
                </div>
              </div>
            ))}
            {allLogs.length === 0 && <EmptyState icon={Zap} message="No clicks recorded yet." />}
          </motion.div>
        ) : (
          <motion.div 
            key="sessions"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {allSessions.map((session) => {
              const duration = session.endTime ? Math.floor((session.endTime - session.startTime) / 1000) : 0;
              const mins = Math.floor(duration / 60);
              const secs = duration % 60;
              
              return (
                <div key={session.id} className="glass p-5 rounded-[28px] spring-shadow group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: session.color }}>
                        <Activity size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{session.counterName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(session.startTime, 'MMM d • h:mm a')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{mins}m {secs}s</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold">
                    <span className="text-slate-400">VALUE</span>
                    <span className="text-slate-900 dark:text-slate-100">{session.startValue}</span>
                    <ArrowRight size={12} className="text-slate-300" />
                    <span className="text-slate-900 dark:text-slate-100">{session.endValue}</span>
                    <span className="ml-auto text-indigo-500">+{session.endValue! - session.startValue} Total</span>
                  </div>
                </div>
              );
            })}
            {allSessions.length === 0 && <EmptyState icon={Clock} message="No smart sessions recorded." />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="py-20 flex flex-col items-center justify-center glass rounded-[40px] border-dashed border-2 border-slate-200 dark:border-slate-800">
    <Icon size={40} className="text-slate-200 dark:text-slate-800 mb-4" />
    <p className="text-slate-400 dark:text-slate-500 font-medium">{message}</p>
  </div>
);

export default HistoryView;
