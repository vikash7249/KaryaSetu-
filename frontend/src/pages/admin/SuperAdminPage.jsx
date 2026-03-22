import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Building2, Users, FolderOpen, CheckSquare, ToggleLeft, ToggleRight, ArrowLeft } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const PLAN_BADGE = {
  free:       'badge bg-gray-100 text-gray-600',
  starter:    'badge bg-blue-100 text-blue-700',
  business:   'badge bg-brand-100 text-brand-700',
  enterprise: 'badge bg-amber-100 text-amber-700',
};

export default function SuperAdminPage() {
  const [tab, setTab] = useState('companies');
  const qc = useQueryClient();

  const { data: statsData } = useQuery({ queryKey: ['admin-stats'],     queryFn: adminAPI.getStats });
  const { data: compData,
          isLoading }       = useQuery({ queryKey: ['admin-companies'], queryFn: adminAPI.getCompanies });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminAPI.toggleCompany(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries(['admin-companies']);
      toast.success(`Company ${res.isActive ? 'activated' : 'deactivated'}`);
    }
  });

  const stats     = statsData?.stats     || { companies: 0, users: 0, projects: 0, tasks: 0 };
  const companies = compData?.companies  || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-brand-400 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={18} />
          <span className="font-semibold text-sm">Super Admin Panel</span>
        </div>
        <Link to="/app/dashboard" className="flex items-center gap-1.5 text-brand-100 hover:text-white text-sm transition-colors">
          <ArrowLeft size={14} /> Back to App
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-gray-900">Platform Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all companies, users, and subscriptions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Companies', value: stats.companies, icon: Building2, color: 'text-brand-400', bg: 'bg-brand-50' },
            { label: 'Total Users',     value: stats.users,     icon: Users,     color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Projects',        value: stats.projects,  icon: FolderOpen,color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Total Tasks',     value: stats.tasks,     icon: CheckSquare,color:'text-purple-600',bg: 'bg-purple-50' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{s.label}</span>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', s.bg)}>
                  <s.icon size={15} className={s.color} />
                </div>
              </div>
              <div className={clsx('font-display text-3xl font-bold', s.color)}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[['companies','Companies'],['logs','Activity Logs']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={clsx('px-5 py-2 rounded-lg text-xs font-semibold transition-all',
              tab===k ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600')}>
              {l}
            </button>
          ))}
        </div>

        {/* Companies Table */}
        {tab === 'companies' && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-display font-bold text-[15px]">Registered Companies</h3>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_,i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Domain</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Users</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Admin</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {companies.map((c, i) => (
                      <motion.tr key={c._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.04 }}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-sm font-bold text-brand-500">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{c.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{c.domain}</code>
                        </td>
                        <td className="px-4 py-4">
                          <span className={PLAN_BADGE[c.plan] || 'badge bg-gray-100 text-gray-600'}>{c.plan}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {c.userCount || 0} / {c.planLimits?.maxUsers}
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="text-xs text-gray-500">{c.admin?.name || '—'}</div>
                          <div className="text-xs text-gray-300">{c.admin?.email}</div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 hidden lg:table-cell">
                          {c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={clsx('badge', c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleMutation.mutate(c._id)}
                            disabled={toggleMutation.isPending}
                            className={clsx('flex items-center gap-1.5 mx-auto text-xs font-medium px-3 py-1.5 rounded-lg transition-all',
                              c.isActive
                                ? 'text-red-500 hover:bg-red-50 border border-red-200'
                                : 'text-green-600 hover:bg-green-50 border border-green-200'
                            )}
                          >
                            {c.isActive
                              ? <><ToggleLeft size={13}/> Deactivate</>
                              : <><ToggleRight size={13}/> Activate</>}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {companies.length === 0 && (
                  <div className="py-16 text-center text-gray-400">
                    <Building2 size={32} className="mx-auto mb-3 opacity-40"/>
                    <p>No companies registered yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity Logs tab */}
        {tab === 'logs' && <ActivityLogsPanel />}
      </div>
    </div>
  );
}

function ActivityLogsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      const api = (await import('../../services/api')).default;
      return api.get('/activitylogs').then(r => r.data);
    }
  });

  const ACTION_ICON = {
    task_created:       { icon: '📋', color: 'bg-brand-50 text-brand-500' },
    task_completed:     { icon: '✅', color: 'bg-green-50 text-green-600' },
    project_created:    { icon: '📂', color: 'bg-amber-50 text-amber-600' },
    company_registered: { icon: '🏢', color: 'bg-purple-50 text-purple-600' },
    file_uploaded:      { icon: '📎', color: 'bg-blue-50 text-blue-600' },
    user_invited:       { icon: '👤', color: 'bg-pink-50 text-pink-600' },
  };

  const logs = data?.logs || [];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-display font-bold text-[15px]">Platform Activity Logs</h3>
      </div>
      {isLoading ? (
        <div className="p-6 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">No activity logs yet</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {logs.map((log, i) => {
            const conf = ACTION_ICON[log.action] || { icon: '•', color: 'bg-gray-50 text-gray-500' };
            return (
              <div key={log._id || i} className="flex items-start gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0', conf.color)}>
                  {conf.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{log.user?.name || 'System'}</span>
                    {' · '}
                    <span className="text-gray-500">{log.action.replace(/_/g, ' ')}</span>
                    {log.entityName && <span className="text-gray-700"> "{log.entityName}"</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.createdAt ? format(new Date(log.createdAt), 'MMM d, yyyy · h:mm a') : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
