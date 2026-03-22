import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, CheckSquare, Columns3, Users,
  Sparkles, BarChart3, Settings, LogOut, Plus, Menu, Shield
} from 'lucide-react';
import useAuthStore from '../../context/authStore';
import { useQuery } from '@tanstack/react-query';
import { notificationsAPI } from '../../services/api';
import clsx from 'clsx';
import NewProjectModal from '../projects/NewProjectModal';
import NotificationBell from '../ui/NotificationBell';

const NAV = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/projects',  icon: FolderOpen,      label: 'Projects'  },
  { to: '/app/tasks',     icon: CheckSquare,     label: 'My Tasks'  },
  { to: '/app/kanban',    icon: Columns3,        label: 'Kanban'    },
  { to: '/app/team',      icon: Users,           label: 'Team'      },
];
const AI_NAV = [
  { to: '/app/ai',        icon: Sparkles,  label: 'AI Assistant' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics'    },
];

export default function AppLayout() {
  const [collapsed, setCollapsed]       = useState(false);
  const [newProjectOpen, setNewProject] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: unread } = useQuery({
    queryKey: ['unread'],
    queryFn: notificationsAPI.getUnreadCount,
    refetchInterval: 30000,
  });

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
  const w = collapsed ? 64 : 240;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4FA]">

      {/* Sidebar */}
      <motion.aside
        animate={{ width: w }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 bg-[#0D0D14] flex flex-col overflow-hidden h-full"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
          <div className="w-8 h-8 bg-brand-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="11" y="8" width="6" height="9" rx="1.5" fill="rgba(255,255,255,0.8)"/>
              <rect x="11" y="3" width="6" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
          {!collapsed && <span className="font-display font-bold text-white text-[17px]">Karya<span className="text-brand-300">Setu</span></span>}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          <div>
            {!collapsed && <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold px-3 mb-2">Workspace</p>}
            <nav className="space-y-0.5">
              {NAV.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-brand-400/20 text-white border-l-2 border-brand-400 pl-[10px]'
                           : 'text-white/45 hover:text-white/80 hover:bg-white/6'
                )}>
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            {!collapsed && <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold px-3 mb-2">AI Tools</p>}
            <nav className="space-y-0.5">
              {AI_NAV.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-brand-400/20 text-white border-l-2 border-brand-400 pl-[10px]'
                           : 'text-white/45 hover:text-white/80 hover:bg-white/6'
                )}>
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            {!collapsed && <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold px-3 mb-2">Account</p>}
            <nav className="space-y-0.5">
              <NavLink to="/app/settings" className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive ? 'bg-brand-400/20 text-white border-l-2 border-brand-400 pl-[10px]'
                         : 'text-white/45 hover:text-white/80 hover:bg-white/6'
              )}>
                <Settings size={16} className="flex-shrink-0" />
                {!collapsed && 'Settings'}
              </NavLink>
              {hasRole(['super_admin']) && (
                <NavLink to="/superadmin" className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-brand-400/20 text-white border-l-2 border-brand-400 pl-[10px]'
                           : 'text-white/45 hover:text-white/80 hover:bg-white/6'
                )}>
                  <Shield size={16} className="flex-shrink-0" />
                  {!collapsed && 'Super Admin'}
                </NavLink>
              )}
            </nav>
          </div>
        </div>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/8">
          <div className={clsx('flex items-center gap-2.5', collapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-white/35 capitalize">{user?.role?.replace('_',' ')}</p>
                </div>
                <button onClick={logout} className="p-1.5 text-white/30 hover:text-white/70 rounded-lg hover:bg-white/8 transition-all">
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0">
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setNewProject(true)} className="btn-primary py-2 px-3.5 text-xs">
              <Plus size={13} /> New Project
            </button>
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center text-xs font-bold text-white cursor-pointer" onClick={() => navigate('/app/settings')}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <NewProjectModal open={newProjectOpen} onClose={() => setNewProject(false)} />
    </div>
  );
}
