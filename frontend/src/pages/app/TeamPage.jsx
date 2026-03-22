import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Mail, Crown, Star, UserX, Trophy } from 'lucide-react';
import { usersAPI, authAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import { AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import useAuthStore from '../../context/authStore';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const COLORS = ['#5D4EED','#16A34A','#D97706','#DC2626','#7C3AED','#EC4899','#0891B2'];
const ROLE_BADGE = {
  super_admin:    'bg-purple-100 text-purple-700',
  company_admin:  'bg-brand-100 text-brand-700',
  project_manager:'bg-amber-100 text-amber-700',
  employee:       'bg-gray-100 text-gray-600',
};

const MOCK = [
  { _id:'u1', name:'Rahul Sharma',  email:'rahul@co.com',  role:'company_admin',   profile:{jobTitle:'Product Manager'}, productivityScore:92, points:4800, badges:[{name:'Leader',icon:'👑'}]  },
  { _id:'u2', name:'Priya Sharma',  email:'priya@co.com',  role:'project_manager', profile:{jobTitle:'UI/UX Designer'},   productivityScore:96, points:5200, badges:[{name:'Speed',icon:'⚡'}]   },
  { _id:'u3', name:'Arjun Mehta',   email:'arjun@co.com',  role:'employee',        profile:{jobTitle:'Full Stack Dev'},   productivityScore:78, points:3200, badges:[]                            },
  { _id:'u4', name:'Neha Kapoor',   email:'neha@co.com',   role:'employee',        profile:{jobTitle:'Backend Dev'},      productivityScore:88, points:3900, badges:[{name:'Streak',icon:'🔥'}]  },
  { _id:'u5', name:'Raj Kumar',     email:'raj@co.com',    role:'employee',        profile:{jobTitle:'DevOps Engineer'},  productivityScore:82, points:3500, badges:[]                            },
  { _id:'u6', name:'Shreya Verma',  email:'shreya@co.com', role:'employee',        profile:{jobTitle:'QA Engineer'},      productivityScore:74, points:2800, badges:[]                            },
];

function InviteModal({ open, onClose }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState:{errors,isSubmitting} } = useForm({ defaultValues:{role:'employee'} });

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.inviteUser(data);
      toast.success(res.message || 'Invitation sent!');
      qc.invalidateQueries(['team']); reset(); onClose();
    } catch (e) { toast.error(e.message || 'Failed to send invite'); }
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
        <motion.div initial={{opacity:0,scale:0.96,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96}} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-gray-900">Invite Team Member</h3>
              <p className="text-xs text-gray-400 mt-0.5">Must use @{user?.company?.domain} email</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X size={16}/></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Email Address</label>
              <input {...register('email',{required:'Email required'})} type="email" className="input-field" placeholder={`person@${user?.company?.domain||'company.com'}`}/>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Role</label>
              <select {...register('role')} className="input-field">
                <option value="employee">Employee</option>
                <option value="project_manager">Project Manager</option>
              </select>
            </div>
            <div className="bg-gray-50 rounded-xl p-3.5 text-xs text-gray-500 leading-relaxed">
              An invitation email with a temporary password will be sent. User must change password on first login.
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-3">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center py-3">
                {isSubmitting ? <Loader2 size={14} className="animate-spin"/> : <><Mail size={14}/> Send Invite</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function TeamPage() {
  const [view, setView]         = useState('team');
  const [inviteOpen, setInvite] = useState(false);
  const { user, hasRole }       = useAuthStore();
  const qc                      = useQueryClient();

  const { data } = useQuery({ queryKey:['team'], queryFn: usersAPI.getTeam });
  const deactivate = useMutation({ mutationFn: usersAPI.deactivate, onSuccess:()=>{ qc.invalidateQueries(['team']); toast.success('User deactivated'); } });

  const team = (data?.users || MOCK).sort((a,b) => b.productivityScore-a.productivityScore);

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">{team.length} members in workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-0.5">
            {[['team','Members'],['leaderboard','🏆 Leaderboard']].map(([k,l]) => (
              <button key={k} onClick={()=>setView(k)} className={clsx('px-4 py-1.5 rounded-lg text-xs font-semibold transition-all', view===k?'bg-white text-gray-800 shadow-sm':'text-gray-400 hover:text-gray-600')}>{l}</button>
            ))}
          </div>
          {hasRole(['company_admin','super_admin']) && (
            <button onClick={()=>setInvite(true)} className="btn-primary text-sm"><Plus size={14}/> Invite</button>
          )}
        </div>
      </div>

      {view === 'team' ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {team.map((m,i) => {
            const initials = m.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
            const sc = m.productivityScore>=90?'text-green-600':m.productivityScore>=75?'text-amber-500':'text-red-500';
            return (
              <motion.div key={m._id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="card p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-3" style={{background:COLORS[i%COLORS.length]}}>{initials}</div>
                <h3 className="font-display font-bold text-[15px] text-gray-900 mb-0.5">{m.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{m.profile?.jobTitle||'Team Member'}</p>
                <span className={clsx('badge mb-4',ROLE_BADGE[m.role])}>{m.role?.replace('_',' ')}</span>
                {m.badges?.length>0 && <div className="flex gap-1.5 mb-4 justify-center">{m.badges.map((b,j)=><span key={j} className="text-sm" title={b.name}>{b.icon}</span>)}</div>}
                <div className="w-full border-t border-gray-50 pt-4 grid grid-cols-3 gap-0">
                  <div className="text-center"><p className={clsx('font-display font-bold text-lg leading-none',sc)}>{m.productivityScore}</p><p className="text-[10px] text-gray-400 mt-1">Score</p></div>
                  <div className="text-center border-x border-gray-50"><p className="font-display font-bold text-lg leading-none text-gray-800">{m.points?.toLocaleString()||0}</p><p className="text-[10px] text-gray-400 mt-1">Points</p></div>
                  <div className="text-center"><p className="font-display font-bold text-lg leading-none text-brand-400">{m.badges?.length||0}</p><p className="text-[10px] text-gray-400 mt-1">Badges</p></div>
                </div>
                {hasRole(['company_admin','super_admin']) && m._id!==user?._id && (
                  <button onClick={()=>deactivate.mutate(m._id)} className="mt-3 p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500 transition-all"><UserX size={13}/></button>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="grid xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 card overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
              <Trophy size={16} className="text-amber-500"/><h3 className="font-display font-bold text-[15px]">Productivity Rankings</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {team.map((m,i) => {
                const initials = m.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
                const sc = m.productivityScore>=90?'text-green-600':m.productivityScore>=75?'text-brand-400':'text-amber-500';
                return (
                  <motion.div key={m._id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}} className={clsx('flex items-center gap-4 px-6 py-4',i===0&&'bg-amber-50/50')}>
                    <div className="w-8 text-center font-display font-bold text-lg text-gray-400">{i<3?['🥇','🥈','🥉'][i]:i+1}</div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.profile?.jobTitle}</p>
                    </div>
                    <div className="hidden md:block flex-1 mx-4">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${m.productivityScore}%`}} transition={{delay:0.3+i*0.07,duration:0.8}} className="h-full rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                      </div>
                    </div>
                    <div className={clsx('font-display font-bold text-xl w-12 text-right',sc)}>{m.productivityScore}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-brand-400 to-brand-600 border-brand-400 text-white">
            <Trophy size={20} className="text-brand-200 mb-3"/>
            <h3 className="font-display font-bold text-[15px] mb-2">Monthly Reward 🎁</h3>
            <p className="text-brand-100 text-sm leading-relaxed mb-4">Top performer wins: <strong className="text-white">₹2,000 Amazon Gift Card</strong></p>
            <div className="bg-brand-500/50 rounded-xl p-3">
              <p className="text-xs text-brand-200 mb-1">Current Leader</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{team[0]?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <span className="font-semibold text-white text-sm">{team[0]?.name}</span>
                <span className="ml-auto font-display font-bold text-white">{team[0]?.productivityScore} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <InviteModal open={inviteOpen} onClose={()=>setInvite(false)}/>
    </div>
  );
}
