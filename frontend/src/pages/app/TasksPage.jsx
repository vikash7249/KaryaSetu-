import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckCircle, Clock, Circle, Loader2, Trash2 } from 'lucide-react';
import { tasksAPI } from '../../services/api';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';

const STATUS = { pending:{label:'Pending',icon:Circle,cls:'badge-pending'}, in_progress:{label:'In Progress',icon:Clock,cls:'badge-progress'}, completed:{label:'Completed',icon:CheckCircle,cls:'badge-done'} };
const PRIO   = { critical:{dot:'bg-red-500',cls:'badge bg-red-100 text-red-700'}, high:{dot:'bg-orange-500',cls:'badge bg-orange-100 text-orange-700'}, medium:{dot:'bg-amber-400',cls:'badge bg-amber-100 text-amber-700'}, low:{dot:'bg-green-400',cls:'badge bg-green-100 text-green-700'} };

const MOCK = [
  { _id:'t1', title:'Design new homepage UI',      project:{name:'Website Redesign'}, assignedTo:{name:'Priya Sharma'},  status:'completed',   priority:'high',     dueDate: new Date(Date.now()-86400000*2)  },
  { _id:'t2', title:'Integrate payment gateway',   project:{name:'Mobile App v2'},    assignedTo:{name:'Arjun Mehta'},   status:'in_progress', priority:'critical', dueDate: new Date(Date.now()+86400000*1)  },
  { _id:'t3', title:'Write API documentation',     project:{name:'Backend API'},      assignedTo:{name:'Neha Kapoor'},   status:'pending',     priority:'medium',   dueDate: new Date(Date.now()+86400000*5)  },
  { _id:'t4', title:'Set up CI/CD pipeline',       project:{name:'DevOps'},           assignedTo:{name:'Raj Kumar'},     status:'in_progress', priority:'high',     dueDate: new Date(Date.now()+86400000*7)  },
  { _id:'t5', title:'User testing round 2',        project:{name:'Website Redesign'}, assignedTo:{name:'Shreya Verma'},  status:'pending',     priority:'low',      dueDate: new Date(Date.now()+86400000*9)  },
];

function dueLabel(d) {
  if (!d) return null;
  if (isPast(new Date(d)))     return { text:'Overdue',      cls:'text-red-500'   };
  if (isToday(new Date(d)))    return { text:'Due today',    cls:'text-amber-500 font-semibold' };
  if (isTomorrow(new Date(d))) return { text:'Due tomorrow', cls:'text-amber-400' };
  return { text: format(new Date(d),'MMM d'), cls:'text-gray-400' };
}

export default function TasksPage() {
  const [search, setSearch]       = useState('');
  const [statusF, setStatusF]     = useState('all');
  const [priorityF, setPriorityF] = useState('all');
  const { canUpload } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', statusF, priorityF],
    queryFn: () => tasksAPI.getAll({ status: statusF!=='all'?statusF:undefined, priority: priorityF!=='all'?priorityF:undefined })
  });

  const statusMut = useMutation({
    mutationFn: ({id,s}) => tasksAPI.updateStatus(id,s),
    onSuccess: () => { qc.invalidateQueries(['tasks']); qc.invalidateQueries(['dashboard']); toast.success('Status updated'); }
  });

  const delMut = useMutation({
    mutationFn: tasksAPI.delete,
    onSuccess: () => { qc.invalidateQueries(['tasks']); toast.success('Task deleted'); }
  });

  const tasks = data?.tasks || MOCK;
  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusF   !== 'all' && t.status   !== statusF)   return false;
    if (priorityF !== 'all' && t.priority !== priorityF) return false;
    return true;
  });

  const counts = { all:tasks.length, pending:tasks.filter(t=>t.status==='pending').length, in_progress:tasks.filter(t=>t.status==='in_progress').length, completed:tasks.filter(t=>t.status==='completed').length };

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{filtered.length} of {tasks.length} tasks</p>
        </div>
        {canUpload() && <button className="btn-primary text-sm"><Plus size={14}/> Add Task</button>}
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
        {Object.entries({all:'All',pending:'Pending',in_progress:'In Progress',completed:'Completed'}).map(([k,l]) => (
          <button key={k} onClick={() => setStatusF(k)} className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
            statusF===k ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600')}>
            {l}
            <span className={clsx('px-1.5 py-0.5 rounded-md text-[10px] font-bold', statusF===k ? 'bg-brand-100 text-brand-600' : 'bg-gray-200 text-gray-400')}>{counts[k]}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..." className="input-field pl-9 py-2.5"/>
        </div>
        <select value={priorityF} onChange={e=>setPriorityF(e.target.value)} className="input-field w-36 py-2.5 text-sm">
          <option value="all">All Priority</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center"><p className="font-semibold text-gray-600">No tasks found</p><p className="text-sm text-gray-400 mt-1">Try changing filters</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">Task</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100 hidden md:table-cell">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100 hidden lg:table-cell">Assignee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100 hidden sm:table-cell">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100 hidden md:table-cell">Due</th>
                <th className="px-4 py-3 bg-gray-50 border-b border-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const sc = STATUS[t.status];
                const dl = dueLabel(t.dueDate);
                return (
                  <motion.tr key={t._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                    className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5 border-b border-gray-50">
                      <div className="flex items-start gap-3">
                        <div className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', PRIO[t.priority]?.dot)}/>
                        <div className="min-w-0">
                          <p className={clsx('font-medium text-[13px] text-gray-800 truncate', t.status==='completed' && 'line-through text-gray-400')}>{t.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-50 hidden md:table-cell">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{t.project?.name}</span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-50 hidden lg:table-cell">
                      {t.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-400 flex items-center justify-center text-[10px] font-bold text-white">{t.assignedTo.name?.charAt(0)}</div>
                          <span className="text-xs text-gray-600">{t.assignedTo.name?.split(' ')[0]}</span>
                        </div>
                      ) : <span className="text-xs text-gray-300">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-50">
                      <div className="relative group/s">
                        <button className={clsx(sc?.cls, 'cursor-pointer hover:opacity-80 transition-opacity')}>{sc?.label}</button>
                        <div className="absolute top-8 left-0 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1.5 min-w-36 hidden group-hover/s:block">
                          {Object.entries(STATUS).map(([k,v]) => (
                            <button key={k} onClick={() => statusMut.mutate({id:t._id,s:k})}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-600 transition-colors">
                              <v.icon size={12} className={k==='completed'?'text-green-500':k==='in_progress'?'text-brand-400':'text-amber-500'}/>
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-50 hidden sm:table-cell">
                      <span className={PRIO[t.priority]?.cls}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-50 hidden md:table-cell">
                      {dl && <span className={clsx('text-xs', dl.cls)}>{dl.text}</span>}
                    </td>
                    <td className="px-4 py-3.5 border-b border-gray-50 text-center">
                      {canUpload() && (
                        <button onClick={() => { if(window.confirm('Delete task?')) delMut.mutate(t._id); }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={13}/>
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
