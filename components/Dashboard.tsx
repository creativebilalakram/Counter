import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Flame, 
  BarChart3, 
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Target,
  Zap
} from 'lucide-react';
import { Counter } from '../types.ts';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  counters: Counter[];
}

const Dashboard: React.FC<DashboardProps> = ({ counters = [] }) => {
  const navigate = useNavigate();
  
  const stats = useMemo(() => {
    const total = counters.reduce((acc, c) => acc + c.count, 0);
    const today = new Date().setHours(0,0,0,0);
    const todayCount = counters.reduce((acc, c) => {
      return acc + (c.logs || []).filter(l => l.timestamp >= today && l.increment > 0).reduce((sum, l) => sum + l.increment, 0);
    }, 0);
    return { total, todayCount };
  }, [counters]);

  const featured = useMemo(() => {
    return counters.length > 0 ? counters[0] : null;
  }, [counters]);

  const secondary = useMemo(() => {
    return counters.slice(1, 4);
  }, [counters]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Focus</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Your momentum is building.</p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        
        {/* Hero Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="md:col-span-4 lg:col-span-4 glass rounded-[48px] p-10 premium-shadow relative overflow-hidden group cursor-pointer"
          onClick={() => featured && navigate(`/counter/${featured.id}`)}
        >
          <div className="absolute top-0 right-0 p-10">
            <Sparkles className="text-slate-200 dark:text-slate-800 group-hover:text-indigo-400 transition-colors" size={48} />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Prime Velocity</span>
            <div className="flex items-baseline gap-4 mb-auto">
              <h2 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.todayCount}</h2>
              <span className="text-slate-400 font-bold uppercase text-sm tracking-widest">today</span>
            </div>
            
            <div className="h-32 w-full mt-12 -mx-10 translate-y-10">
              <ResponsiveContainer width="110%" height="100%">
                <AreaChart data={[{v:10}, {v:30}, {v:stats.todayCount/1.5}, {v:stats.todayCount}, {v:stats.todayCount*0.9}]}>
                  <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={5} fill="url(#hero-grad)" fillOpacity={0.1} />
                  <defs><linearGradient id="hero-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Vertical Stat Stack */}
        <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-6">
          <div className="glass rounded-[40px] p-8 premium-shadow flex-1 flex flex-col justify-between group hover:bg-white dark:hover:bg-slate-800 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">Consistency</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">12 <span className="text-lg text-slate-400 font-bold">Days</span></h3>
            </div>
          </div>
          <div className="glass rounded-[40px] p-8 premium-shadow flex-1 flex flex-col justify-between group hover:bg-white dark:hover:bg-slate-800 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">Total Impact</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Small Progress Tiles */}
        {secondary.map(counter => (
          <motion.div
            key={counter.id}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => navigate(`/counter/${counter.id}`)}
            className="md:col-span-2 lg:col-span-2 glass rounded-[40px] p-8 premium-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900">
                <Target size={18} />
              </div>
              <ArrowUpRight className="text-slate-200 group-hover:text-indigo-500 transition-colors" size={20} />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white mb-1 truncate">{counter.name}</h4>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mb-4">{counter.count} {counter.goal ? `/ ${counter.goal}` : ''}</p>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full rounded-full" style={{ width: `${Math.min(100, counter.goal ? (counter.count/counter.goal)*100 : 0)}%`, backgroundColor: counter.color }} />
            </div>
          </motion.div>
        ))}

        {/* Empty State / Add Tally */}
        {counters.length < 4 && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/counters')}
            className="md:col-span-2 lg:col-span-2 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 hover:border-indigo-400 transition-all group p-8"
          >
            <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
              <ChevronRight size={32} />
            </div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">Expand Library</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;