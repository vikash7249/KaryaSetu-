import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, Clock } from 'lucide-react';
import { format, isPast } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const COLS = [
  { id:'pending',     label:'Pending',     dot:'bg-amber-400' },
  { id:'in_progress', label:'In Progress', dot:'bg-brand-400' },
  { id:'completed',   label:'Completed',   dot:'bg-green-500' },
];

const PRIO_COLOR = { critical:'bg-red-500', high:'bg-orange-500', medium:'bg-amber-400', low:'bg-green-400' };
const PRIO_BADGE = { critical:'bg-red-100 text-red-700', high:'bg-orange-100 text-orange-700', medium:'bg-amber-100 text-amber-700', low:'bg-green-100 text-green-700' };

const INIT = {
  pending: [
    { _id:'p1', title:'Write API documentation', project:'Backend API',    priority:'medium',   assignee:'NK', dueDate: new Date(Date.now()+86400000*5) },
    { _id:'p2', title:'Competitor analysis',      project:'Strategy',      priority:'high',     assignee:'PS', dueDate: new Date(Date.now()+86400000*3) },
    { _id:'p3', title:'UI component setup',       project:'Design System', priority:'low',      assignee:'SV', dueDate: new Date(Date.now()+86400000*8) },
  ],
  in_progress: [
    { _id:'i1', title:'Integrate payment gateway', project:'Mobile App v2',    priority:'critical', assignee:'AM', dueDate: new Date(Date.now()+86400000*1) },
    { _id:'i2', title:'Set up CI/CD pipeline',     project:'DevOps',           priority:'high',     assignee:'RK', dueDate: new Date(Date.now()+86400000*4) },
    { _id:'i3', title:'Build admin dashboard',     project:'Website Redesign', priority:'medium',   assignee:'PS', dueDate: new Date(Date.now()+86400000*6) },
  ],
  completed: [
    { _id:'c1', title:'Design homepage UI',        project:'Website Redesign', priority:'high',   assignee:'PS', dueDate: new Date(Date.now()-86400000*2) },
    { _id:'c2', title:'Database schema design',    project:'Backend API',      priority:'critical',assignee:'RK', dueDate: new Date(Date.now()-86400000*4) },
    { _id:'c3', title:'Write test cases',          project:'Mobile App v2',    priority:'medium', assignee:'NK', dueDate: new Date(Date.now()-86400000*6) },
  ],
};

const AVATAR_COLORS = { PS:'#5D4EED', AM:'#D97706', NK:'#16A34A', RK:'#DC2626', SV:'#7C3AED' };

export default function KanbanPage() {
  const [cols, setCols] = useState(INIT);

  const onDragEnd = ({ source: s, destination: d }) => {
    if (!d) return;
    if (s.droppableId === d.droppableId && s.index === d.index) return;

    const src = [...cols[s.droppableId]];
    const dst = s.droppableId === d.droppableId ? src : [...cols[d.droppableId]];
    const [item] = src.splice(s.index, 1);
    dst.splice(d.index, 0, { ...item, status: d.droppableId });

    setCols(prev => ({ ...prev, [s.droppableId]: src, [d.droppableId]: dst }));
    toast.success(`Moved to ${d.droppableId.replace('_',' ')}`);
    // In production: tasksAPI.updateStatus(item._id, d.droppableId)
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="page-title">Kanban Board</h1>
          <p className="page-subtitle">Drag and drop tasks between stages</p>
        </div>
        <button className="btn-primary text-sm"><Plus size={14}/> Add Task</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLS.map(col => (
            <div key={col.id} className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={clsx('w-2.5 h-2.5 rounded-full', col.dot)}/>
                  <span className="font-display font-bold text-[14px] text-gray-800">{col.label}</span>
                  <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-2 py-0.5 rounded-full">{cols[col.id].length}</span>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-all"><Plus size={15}/></button>
              </div>

              {/* Column */}
              <Droppable droppableId={col.id}>
                {(prov, snap) => (
                  <div ref={prov.innerRef} {...prov.droppableProps}
                    className={clsx('flex-1 rounded-2xl p-3 min-h-[420px] transition-colors',
                      snap.isDraggingOver ? 'bg-brand-50 border-2 border-dashed border-brand-300' : 'bg-gray-100/60 border-2 border-transparent')}>
                    {cols[col.id].map((task, idx) => (
                      <Draggable key={task._id} draggableId={task._id} index={idx}>
                        {(p, s) => (
                          <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}
                            className={clsx('bg-white border border-gray-100 rounded-xl p-4 mb-3 transition-all cursor-grab',
                              s.isDragging ? 'shadow-xl rotate-1 scale-[1.02] border-brand-300' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5')}>
                            {/* Priority dot + menu */}
                            <div className="flex items-start justify-between mb-3">
                              <div className={clsx('w-2 h-2 rounded-full mt-1.5', PRIO_COLOR[task.priority])}/>
                              <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-300 transition-all -mr-1"><MoreHorizontal size={13}/></button>
                            </div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-1.5 leading-snug">{task.title}</h4>
                            <p className="text-xs text-gray-400 mb-3">{task.project}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: AVATAR_COLORS[task.assignee]||'#5D4EED' }}>
                                  {task.assignee}
                                </div>
                                <span className={clsx('text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize', PRIO_BADGE[task.priority])}>{task.priority}</span>
                              </div>
                              {task.dueDate && (
                                <div className={clsx('flex items-center gap-1 text-[11px]', isPast(new Date(task.dueDate)) ? 'text-red-500' : 'text-gray-400')}>
                                  <Clock size={10}/>{format(new Date(task.dueDate),'MMM d')}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                    <button className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50/50 text-gray-400 hover:text-brand-500 text-sm transition-all flex items-center justify-center gap-2 mt-1">
                      <Plus size={13}/> Add Task
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
