
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Flame, 
  BarChart3, 
  ChevronRight,
  CirclePlay
} from 'lucide-react';
import { Counter } from '../types.ts';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  counters: Counter[];
}

const ActivityRing = ({ progress, color, size = 120, strokeWidth = 12 }: { progress: number, color: string, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, progress) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{Math.round(progress || 0)}%</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ counters = [] }) => {
  const navigate = useNavigate();
  
  const stats = useMemo(() => {
    const totalCounts = (counters || []).reduce((acc, c) => acc + (c.count || 0), 0);
    const today = new Date().setHours(0,0,0,0);
    const countsToday = (counters || []).reduce((acc, c) => {
      const logs = c.logs || [];
      const todayLogs = logs.filter(l => l.timestamp >= today && l.increment > 0);
      return acc + todayLogs.reduce((sum, l) => sum + l.increment, 0);
    }, 0);
    return { totalCounts, countsToday };
  }, [counters]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.setHours(0,0,0,0);
    }).reverse();

    return last7Days.map(ts => {
      const date = new Date(ts);
      const dayTotal = (counters || []).reduce((acc, c) => {
        const logs = c.logs || [];
        const dayLogs = logs.filter(l => new Date(l.timestamp).setHours(0,0,0,0) === ts && l.increment > 0);
        return acc + dayLogs.reduce((sum, l) => sum + l.increment, 0);
      }, 0);
      return { name: date.toLocaleDateString('en-US', { weekday: 'short' }), value: dayTotal };
    });
  }, [counters]);

  const topCounters = useMemo(() => {
    return [...(counters || [])]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 3);
  }, [counters]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 glass p-8 rounded-[32px] spring-shadow relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-slate-900/5 dark:bg-white/5 rounded-full blur-3xl" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Today's Pulse</p>
          <div className="flex items-baseline gap-2 mb-6">
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white">{stats.countsToday}</h2>
            <span className="text-slate-400 dark:text-slate-500 font-medium">counts</span>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  itemStyle={{ color: '#0F172A' }}
                />
                <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" className="text-slate-900 dark:text-slate-100" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:w-80 glass p-8 rounded-[32px] spring-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-6">
              <Trophy size={18} />
              <span className="text-sm font-semibold uppercase tracking-widest">Achievements</span>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Flame size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active Streak</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">12 Days</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Lifetime Total</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalCounts.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">"Energy flows where attention goes."</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
        <h3 className="col-span-full text-xl font-bold text-slate-900 dark:text-white mt-4 flex items-center gap-2">
          Focus Goals
          <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
        </h3>
        {topCounters.map((counter) => (
          <motion.button 
            key={counter.id}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/counter/${counter.id}`)}
            className="glass p-6 rounded-[28px] spring-shadow flex items-center gap-6 text-left group transition-all"
          >
            <ActivityRing progress={counter.goal ? (counter.count / counter.goal) * 100 : 0} color={counter.color} size={80} strokeWidth={8} />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{counter.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">{counter.category}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900 dark:text-white">{counter.count}</span>
                <span className="text-slate-400 dark:text-slate-500">/ {counter.goal || '-'}</span>
              </div>
            </div>
          </motion.button>
        ))}
        {topCounters.length === 0 && (
          <button 
            onClick={() => navigate('/counters')}
            className="col-span-full py-12 flex flex-col items-center justify-center glass rounded-[32px] border-dashed border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-colors"
          >
             <CirclePlay size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
             <p className="text-slate-400 dark:text-slate-500 font-medium">No active counters. Create one to begin.</p>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
