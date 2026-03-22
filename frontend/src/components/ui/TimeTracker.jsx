import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Square, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function TimeTracker({ taskId }) {
  const [elapsed, setElapsed] = useState(0);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['running-timer'],
    queryFn:  () => api.get('/timelogs/running').then(r => r.data),
    refetchInterval: 30000
  });

  const isRunning   = data?.running?.task?._id === taskId || data?.running?.task === taskId;
  const startedAt   = data?.running?.startTime;

  // Tick every second when running
  useEffect(() => {
    if (!isRunning || !startedAt) { setElapsed(0); return; }
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startedAt)) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, startedAt]);

  const startMutation = useMutation({
    mutationFn: () => api.post('/timelogs/start', { taskId }),
    onSuccess:  () => { qc.invalidateQueries(['running-timer']); toast.success('Timer started'); }
  });

  const stopMutation = useMutation({
    mutationFn: () => api.post('/timelogs/stop'),
    onSuccess:  (res) => {
      qc.invalidateQueries(['running-timer']);
      const mins = res.data?.duration || 0;
      toast.success(`Timer stopped — ${mins} min logged`);
    }
  });

  const fmt = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  return (
    <div className={clsx(
      'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all',
      isRunning ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    )}>
      <Clock size={13} className={isRunning ? 'text-green-600' : 'text-gray-400'}/>
      {isRunning && (
        <span className="font-mono text-sm font-semibold text-green-700 min-w-[52px]">{fmt(elapsed)}</span>
      )}
      <button
        onClick={() => isRunning ? stopMutation.mutate() : startMutation.mutate()}
        disabled={startMutation.isPending || stopMutation.isPending}
        className={clsx(
          'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all',
          isRunning
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-brand-400 text-white hover:bg-brand-500'
        )}
      >
        {isRunning ? <><Square size={11} fill="white"/> Stop</> : <><Play size={11} fill="white"/> Start Timer</>}
      </button>
    </div>
  );
}
