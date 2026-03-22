import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, MoreHorizontal, Calendar, AlertCircle } from 'lucide-react';
import { projectsAPI } from '../../services/api';
import { format, isPast } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import NewProjectModal from '../../components/projects/NewProjectModal';

const ICONS = ['🌐','📱','⚙️','📊','🔐','🎨','🚀','💡'];
const COLORS = { active:'bg-green-100 text-green-700', planning:'bg-brand-100 text-brand-700', on_hold:'bg-amber-100 text-amber-700', completed:'bg-gray-100 text-gray-600' };
const PROG = (p) => p >= 70 ? 'bg-green-500' : p >= 40 ? 'bg-brand-400' : p >= 20 ? 'bg-amber-500' : 'bg-red-500';

const MOCK = [
  { _id:'p1', name:'Website Redesign',  description:'Complete overhaul with new design system', status:'active',    priority:'high',     progress:72, dueDate: new Date(Date.now()+86400000*18), team:[{name:'Priya'},{name:'Arjun'}] },
  { _id:'p2', name:'Mobile App v2',     description:'iOS & Android with payment integration',   status:'active',    priority:'critical', progress:45, dueDate: new Date(Date.now()+86400000*33), team:[{name:'Arjun'},{name:'Raj'}] },
  { _id:'p3', name:'Backend API v3',    description:'REST to GraphQL migration',                status:'planning',  priority:'medium',   progress:30, dueDate: new Date(Date.now()+86400000*58), team:[{name:'Raj'}] },
  { _id:'p4', name:'Analytics Dashboard',description:'BI dashboard for executive reporting',   status:'active',    priority:'high',     progress:88, dueDate: new Date(Date.now()+86400000*12), team:[{name:'Priya'},{name:'Neha'}] },
];

export default function ProjectsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey:['projects'], queryFn: projectsAPI.getAll });

  const delMutation = useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['projects']); toast.success('Project deleted'); }
  });

  const projects = data?.projects || MOCK;
  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} projects in your workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl gap-0.5">
            {['all','active','planning','on_hold'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all', filter===f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600')}>
                {f === 'on_hold' ? 'On Hold' : f}
              </button>
            ))}
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm"><Plus size={14}/> New Project</button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_,i) => <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
              className="card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl">{ICONS[i % ICONS.length]}</div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={15}/></button>
              </div>
              <Link to={`/app/projects`}>
                <h3 className="font-display font-bold text-[16px] text-gray-900 hover:text-brand-500 transition-colors mb-1.5">{p.name}</h3>
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">{p.description}</p>
              <div className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-gray-400">Progress</span>
                  <span className={clsx('text-xs font-bold', p.progress>=70?'text-green-600':p.progress>=40?'text-brand-400':'text-amber-500')}>{p.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${p.progress}%` }} transition={{ delay:0.3+i*0.06, duration:0.8 }}
                    className={clsx('h-full rounded-full', PROG(p.progress))}/>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                <div className="flex">
                  {(p.team||[]).slice(0,4).map((m,j) => (
                    <div key={j} title={m.name||m} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white" style={{ background:['#5D4EED','#16A34A','#D97706','#DC2626'][j%4], marginLeft: j>0?'-6px':0 }}>
                      {(m.name||m).charAt(0)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('badge text-[10px]', COLORS[p.status])}>{p.status?.replace('_',' ')}</span>
                  {p.dueDate && (
                    <span className={clsx('flex items-center gap-1 text-[11px]', isPast(new Date(p.dueDate)) && p.status!=='completed' ? 'text-red-500' : 'text-gray-400')}>
                      {isPast(new Date(p.dueDate)) && <AlertCircle size={10}/>}
                      <Calendar size={10}/> {format(new Date(p.dueDate),'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add card */}
          <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:filtered.length*0.06 }}
            onClick={() => setModalOpen(true)}
            className="border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all group min-h-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
              <Plus size={22} className="text-gray-400 group-hover:text-brand-500 transition-colors"/>
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-gray-400 group-hover:text-brand-500 transition-colors">New Project</p>
              <p className="text-xs text-gray-300 mt-0.5">or use AI Planner ✦</p>
            </div>
          </motion.button>
        </div>
      )}

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)}/>
    </div>
  );
}
