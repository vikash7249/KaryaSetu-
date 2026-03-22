import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { projectsAPI, aiAPI, usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function NewProjectModal({ open, onClose }) {
  const [aiMode, setAiMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiPlan, setAiPlan] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const qc = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({ defaultValues: { priority: 'medium' } });

  const { data: teamData } = useQuery({ queryKey:['team-list'], queryFn: usersAPI.getTeam, enabled: open });
  const team = teamData?.users || [];

  const createMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      qc.invalidateQueries(['projects']);
      qc.invalidateQueries(['dashboard']);
      toast.success('Project created!');
      onClose(); reset();
      setAiPlan(null); setAiPrompt('');
    }
  });

  const handleAiPlan = async () => {
    if (!aiPrompt.trim()) { toast.error('Describe your project'); return; }
    setAiLoading(true);
    try {
      const res = await aiAPI.planProject(aiPrompt);
      setAiPlan(res.plan);
      setValue('name', aiPrompt.split(' ').slice(0,5).join(' '));
      toast.success('AI plan generated!');
    } catch { toast.error('AI planning failed'); }
    finally { setAiLoading(false); }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target===e.currentTarget && onClose()}>
        <motion.div initial={{ opacity:0, scale:0.96, y:16 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900">Create New Project</h3>
              <p className="text-xs text-gray-400 mt-0.5">Fill manually or use AI planner</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all"><X size={18}/></button>
          </div>

          <div className="p-7 max-h-[75vh] overflow-y-auto">
            {/* AI Toggle */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-brand-50 border border-brand-200 rounded-xl">
              <div className="w-8 h-8 bg-brand-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-white"/>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brand-800">AI Project Planner</p>
                <p className="text-xs text-brand-600">Describe goal → AI builds full plan</p>
              </div>
              <button type="button" onClick={() => setAiMode(!aiMode)}
                className={clsx('w-10 h-5 rounded-full transition-all relative flex-shrink-0', aiMode ? 'bg-brand-400' : 'bg-gray-200')}>
                <div className={clsx('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', aiMode ? 'left-[22px]' : 'left-0.5')}/>
              </button>
            </div>

            {aiMode && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Describe your project</label>
                <div className="flex gap-2">
                  <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key==='Enter' && handleAiPlan()}
                    placeholder='"Build a mobile app in 45 days"' className="input-field flex-1"/>
                  <button type="button" onClick={handleAiPlan} disabled={aiLoading} className="btn-primary px-4">
                    {aiLoading ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                  </button>
                </div>
                {aiPlan && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-800 mb-3">✦ AI Plan Ready</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                        <p className="font-bold text-brand-400 text-lg">{aiPlan.tasks?.length||0}</p>
                        <p className="text-[11px] text-gray-400">Tasks</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                        <p className="font-bold text-green-600 text-lg">{aiPlan.sprints?.length||0}</p>
                        <p className="text-[11px] text-gray-400">Sprints</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                        <p className="font-bold text-amber-500 text-lg">{aiPlan.risks?.length||0}</p>
                        <p className="text-[11px] text-gray-400">Risks</p>
                      </div>
                    </div>
                    {aiPlan.risks?.[0] && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                        <AlertTriangle size={11} className="text-amber-600 mt-0.5 flex-shrink-0"/>
                        <p className="text-[11px] text-amber-700">{aiPlan.risks[0]}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit(d => createMutation.mutate({ ...d, aiGenerated:!!aiPlan, aiPlanData:aiPlan }))} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Project Name *</label>
                <input {...register('name', { required:'Project name required' })} className="input-field" placeholder="e.g. Website Redesign 2.0"/>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Description</label>
                <textarea {...register('description')} rows={2} className="input-field resize-none" placeholder="Brief description..."/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Priority</label>
                  <select {...register('priority')} className="input-field">
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Due Date</label>
                  <input {...register('dueDate')} type="date" className="input-field"/>
                </div>
              </div>
              {team.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Assign Team</label>
                  <div className="flex flex-wrap gap-2">
                    {team.map(m => (
                      <label key={m._id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-brand-300 rounded-xl cursor-pointer transition-all">
                        <input type="checkbox" {...register('teamIds')} value={m._id} className="w-3 h-3 accent-brand-400"/>
                        <div className="w-5 h-5 rounded-full bg-brand-400 flex items-center justify-center text-[9px] font-bold text-white">{m.name.charAt(0)}</div>
                        <span className="text-xs font-medium text-gray-700">{m.name.split(' ')[0]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 justify-center py-3">
                  {createMutation.isPending ? <Loader2 size={14} className="animate-spin"/> : aiPlan ? '✦ Create with AI Plan' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
