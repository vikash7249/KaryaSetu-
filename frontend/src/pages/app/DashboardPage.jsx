import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FolderOpen, CheckSquare, Clock, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import { format } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import clsx from 'clsx';

const CHART = [
  {d:'Mon',v:3},{d:'Tue',v:7},{d:'Wed',v:5},{d:'Thu',v:9},{d:'Fri',v:6},{d:'Sat',v:11},{d:'Sun',v:8}
];

const STATUS = {
  pending:     'badge-pending',
  in_progress: 'badge-progress',
  completed:   'badge-done',
  on_hold:     'badge bg-gray-100 text-gray-600',
};

const PRIO_DOT = {
  critical:'bg-red-500', high:'bg-orange-500', medium:'bg-amber-400', low:'bg-green-400'
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const name = user?.name?.split(' ')[0] || 'there';
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: analyticsAPI.getDashboard });

  const stats  = data?.stats       || { projects: 5, tasksInProgress: 18, completed: 47, productivity: 87 };
  const tasks  = data?.recentTasks || [];
  const insight= data?.aiInsight   || 'Analyzing your workspace...';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="page-title">{greeting}, {name} 👋</h2>
            <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <Link to="/app/ai" className="btn-primary text-sm hidden md:flex"><Sparkles size={14} /> Ask AI</Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Active Projects', value: stats.projects,          icon: FolderOpen,  color:'text-brand-400',  bg:'bg-brand-50'  },
          { label:'In Progress',     value: stats.tasksInProgress,   icon: Clock,       color:'text-amber-500',  bg:'bg-amber-50'  },
          { label:'Completed',       value: stats.completed,         icon: CheckSquare, color:'text-green-600',  bg:'bg-green-50'  },
          { label:'Productivity',    value: `${stats.productivity}%`,icon: TrendingUp,  color:'text-purple-600', bg:'bg-purple-50' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
            className="card p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{s.label}</span>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', s.bg)}>
                <s.icon size={15} className={s.color} />
              </div>
            </div>
            <div className={clsx('font-display text-3xl font-bold leading-none', s.color)}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Tasks */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="xl:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-display font-bold text-[15px]">Recent Tasks</h3>
            <Link to="/app/tasks" className="text-xs text-brand-400 hover:text-brand-500 font-medium flex items-center gap-1">View all <ArrowRight size={11} /></Link>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">No tasks yet. Create a project to get started!</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tasks.map(t => (
                <div key={t._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', PRIO_DOT[t.priority])} />
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm font-medium text-gray-800 truncate', t.status==='completed' && 'line-through text-gray-400')}>{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.project?.name}</p>
                  </div>
                  <span className={STATUS[t.status]}>{t.status==='in_progress'?'In Progress':t.status==='completed'?'Done':'Pending'}</span>
                  {t.dueDate && <span className="text-xs text-gray-400 hidden sm:block">{format(new Date(t.dueDate),'MMM d')}</span>}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right */}
        <div className="space-y-4">
          {/* AI Insight */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
            className="card p-5 border-brand-200 bg-gradient-to-br from-brand-50/50 to-white">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-brand-400 rounded-lg flex items-center justify-center">
                <Sparkles size={13} className="text-white" />
              </div>
              <span className="font-display font-bold text-[13px] text-brand-800">AI Insight</span>
              <span className="ml-auto text-[10px] bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full font-semibold">Live</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
            <Link to="/app/ai" className="mt-3 text-xs text-brand-500 font-semibold hover:text-brand-600 flex items-center gap-1">
              Ask AI for help <ArrowRight size={11} />
            </Link>
          </motion.div>

          {/* Mini chart */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="card p-5">
            <h3 className="font-display font-bold text-[14px] mb-3">Tasks This Week</h3>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={CHART} margin={{ top:0, right:0, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5D4EED" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#5D4EED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#5D4EED" strokeWidth={2} fill="url(#g)" dot={false}/>
                <Tooltip content={({active,payload}) => active && payload?.length
                  ? <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs shadow-sm"><span className="font-bold text-brand-400">{payload[0].value}</span> tasks</div>
                  : null}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
