import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Target, Zap, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI } from '../../services/api';
import clsx from 'clsx';

const WEEKLY = [
  {d:'Mon',c:4,p:7},{d:'Tue',c:7,p:9},{d:'Wed',c:5,p:11},{d:'Thu',c:9,p:8},{d:'Fri',c:11,p:6},{d:'Sat',c:6,p:5},{d:'Sun',c:3,p:4}
];
const PIE_DATA = [
  {name:'Completed',value:47,color:'#16A34A'},
  {name:'In Progress',value:18,color:'#5D4EED'},
  {name:'Pending',value:7,color:'#F59E0B'},
];
const TEAM = [
  {name:'Priya S.',score:96,color:'#5D4EED'},
  {name:'Rahul S.',score:92,color:'#16A34A'},
  {name:'Neha K.', score:88,color:'#D97706'},
  {name:'Raj K.',  score:82,color:'#DC2626'},
  {name:'Arjun M.',score:78,color:'#7C3AED'},
];

const Tip = ({active,payload,label}) => active && payload?.length ? (
  <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs shadow-sm">
    <p className="font-semibold text-gray-700 mb-1">{label}</p>
    {payload.map(p => <div key={p.name} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{background:p.color}}/><span className="text-gray-500">{p.name}:</span><span className="font-semibold">{p.value}</span></div>)}
  </div>
) : null;

export default function AnalyticsPage() {
  const { data } = useQuery({ queryKey:['analytics-dashboard'], queryFn: analyticsAPI.getDashboard });

  return (
    <div className="space-y-6">
      <div><h1 className="page-title">Analytics</h1><p className="page-subtitle">Productivity intelligence across your workspace</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {label:'Avg Completion Time', value:'2.3 days', change:'↓ from 3.1d', icon:Target,  color:'text-brand-400', bg:'bg-brand-50'},
          {label:'On-Time Delivery',    value:'84%',      change:'↑ from 76%',  icon:TrendingUp,color:'text-green-600',bg:'bg-green-50'},
          {label:'Rework Rate',         value:'8%',       change:'↓ from 14%',  icon:Zap,      color:'text-amber-500', bg:'bg-amber-50'},
          {label:'Team Efficiency',     value:'87%',      change:'↑ from 81%',  icon:AlertTriangle,color:'text-purple-600',bg:'bg-purple-50'},
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} className="card p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{s.label}</span>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center',s.bg)}><s.icon size={15} className={s.color}/></div>
            </div>
            <div className={clsx('font-display text-2xl font-bold',s.color)}>{s.value}</div>
            <p className="text-xs text-green-600">{s.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-3 gap-5">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-[15px]">Task Activity</h3>
            <div className="flex items-center gap-3 text-xs">
              {[{color:'#5D4EED',l:'Completed'},{color:'#16A34A',l:'In Progress'}].map(x => (
                <div key={x.l} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:x.color}}/><span className="text-gray-400">{x.l}</span></div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={WEEKLY} margin={{top:5,right:5,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5D4EED" stopOpacity={0.15}/><stop offset="100%" stopColor="#5D4EED" stopOpacity={0}/></linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity={0.15}/><stop offset="100%" stopColor="#16A34A" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
              <XAxis dataKey="d" tick={{fontSize:11,fill:'#9CA3AF'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'#9CA3AF'}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="c" name="Completed" stroke="#5D4EED" strokeWidth={2.5} fill="url(#gc)" dot={false}/>
              <Area type="monotone" dataKey="p" name="In Progress" stroke="#16A34A" strokeWidth={2} fill="url(#gp)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="card p-6">
          <h3 className="font-display font-bold text-[15px] mb-6">Task Status</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                {PIE_DATA.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={(v,n)=>[v+' tasks',n]}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {PIE_DATA.map(x => (
              <div key={x.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:x.color}}/><span className="text-xs text-gray-600">{x.name}</span></div>
                <span className="text-xs font-semibold text-gray-800">{x.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Productivity */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="card p-6">
        <h3 className="font-display font-bold text-[15px] mb-5">Employee Productivity Scores</h3>
        <div className="space-y-4">
          {TEAM.map((m,i) => (
            <div key={m.name} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{background:m.color}}>{m.name.charAt(0)}</div>
              <div className="w-20 text-sm font-medium text-gray-700 flex-shrink-0">{m.name}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{width:0}} animate={{width:`${m.score}%`}} transition={{delay:0.5+i*0.08,duration:0.8}} className="h-full rounded-full" style={{background:m.color}}/>
              </div>
              <div className="w-8 text-sm font-bold text-right" style={{color:m.color}}>{m.score}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Risks */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.45}} className="card p-6">
        <div className="flex items-center gap-2.5 mb-5"><div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center"><AlertTriangle size={15} className="text-amber-600"/></div><h3 className="font-display font-bold text-[15px]">AI Risk Alerts</h3></div>
        <div className="space-y-3">
          {[
            {level:'HIGH',   project:'Sprint 3',        msg:'4 days behind. 3 blockers identified. Risk of missing deadline.',    cls:'bg-red-50 border-red-200', tc:'text-red-700', bc:'bg-red-100 text-red-700'},
            {level:'MEDIUM', project:'Mobile App v2',   msg:'Payment SDK dependency delayed. Recommend starting parallel tasks.', cls:'bg-amber-50 border-amber-200', tc:'text-amber-700', bc:'bg-amber-100 text-amber-700'},
            {level:'LOW',    project:'Analytics Dashboard',msg:'88% complete, on track for release.',                             cls:'bg-green-50 border-green-200', tc:'text-green-700', bc:'bg-green-100 text-green-700'},
          ].map(a => (
            <div key={a.project} className={clsx('flex items-start gap-3 p-4 rounded-xl border',a.cls)}>
              <span className={clsx('badge text-[10px] mt-0.5 flex-shrink-0',a.bc)}>{a.level}</span>
              <div><p className={clsx('text-sm font-semibold',a.tc)}>{a.project}</p><p className={clsx('text-xs leading-relaxed mt-0.5',a.tc,'opacity-80')}>{a.msg}</p></div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
