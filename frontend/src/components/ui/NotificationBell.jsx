import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { notificationsAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import useAuthStore from '../../context/authStore';
import { io } from 'socket.io-client';

const TYPE_ICON = {
  task_assigned:     { icon: '📋', bg: 'bg-brand-50' },
  task_completed:    { icon: '✅', bg: 'bg-green-50' },
  deadline_reminder: { icon: '⏰', bg: 'bg-amber-50' },
  ai_alert:          { icon: '✦', bg: 'bg-brand-50'  },
  invitation:        { icon: '👤', bg: 'bg-purple-50' },
  report_ready:      { icon: '📊', bg: 'bg-blue-50'   },
};

// Singleton socket
let socket = null;

const getSocket = (token, companyId) => {
  if (!socket && token) {
    socket = io(process.env.REACT_APP_API_URL?.replace('/api','') || '', {
      auth: { token, companyId },
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { user, token  } = useAuthStore();
  const qc = useQueryClient();

  // Real-time socket
  useEffect(() => {
    if (!token || !user?.company?._id) return;
    const s = getSocket(token, user.company._id);
    if (!s) return;

    s.on('task:completed', () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['unread']);
    });
    s.on('task:assigned', () => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['unread']);
    });

    return () => {
      s.off('task:completed');
      s.off('task:assigned');
    };
  }, [token, user?.company?._id]);

  const { data: unreadData } = useQuery({
    queryKey: ['unread'],
    queryFn:  notificationsAPI.getUnreadCount,
    refetchInterval: 30000
  });

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn:  notificationsAPI.getAll,
    enabled:  open
  });

  const markReadMut = useMutation({
    mutationFn: notificationsAPI.markRead,
    onSuccess:  () => { qc.invalidateQueries(['notifications']); qc.invalidateQueries(['unread']); }
  });

  const markAllMut = useMutation({
    mutationFn: notificationsAPI.markAllRead,
    onSuccess:  () => { qc.invalidateQueries(['notifications']); qc.invalidateQueries(['unread']); }
  });

  const unreadCount  = unreadData?.count    || 0;
  const notifications= data?.notifications  || [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity:0, scale:0.96, y:-8 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.96, y:-8 }}
              transition={{ duration:0.15 }}
              className="absolute top-12 right-0 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-[14px]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-brand-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button onClick={() => markAllMut.mutate()}
                      className="flex items-center gap-1 text-[11px] text-brand-500 hover:text-brand-600 font-medium px-2 py-1 rounded-lg hover:bg-brand-50 transition-all">
                      <CheckCheck size={11} /> All read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={22} className="text-gray-200 mx-auto mb-2"/>
                    <p className="text-sm text-gray-400">All caught up!</p>
                  </div>
                ) : notifications.map((n) => {
                  const conf = TYPE_ICON[n.type] || { icon: '•', bg: 'bg-gray-50' };
                  return (
                    <div key={n._id}
                      onClick={() => !n.isRead && markReadMut.mutate(n._id)}
                      className={clsx('flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors', !n.isRead && 'bg-brand-50/30')}
                    >
                      <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5', conf.bg)}>
                        {conf.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-gray-300 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 bg-brand-400 rounded-full mt-2 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
