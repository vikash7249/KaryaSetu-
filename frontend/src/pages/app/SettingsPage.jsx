import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const { register: rp, handleSubmit: hsp, formState:{errors:ep,isSubmitting:isp} } = useForm({ defaultValues:{ jobTitle: user?.profile?.jobTitle||'', designation: user?.profile?.designation||'', contactNumber: user?.profile?.contactNumber||'' } });
  const { register: rc, handleSubmit: hsc, formState:{errors:ec,isSubmitting:isc}, watch } = useForm();

  const profileMut = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (res) => { updateUser(res.user); toast.success('Profile updated!'); }
  });

  const passMut = useMutation({
    mutationFn: authAPI.changePassword,
    onSuccess: () => toast.success('Password changed!')
  });

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage your account and preferences</p></div>

      {/* Profile */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="card p-7">
        <h3 className="font-display font-bold text-[16px] mb-6">Profile</h3>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-brand-400 flex items-center justify-center text-xl font-bold text-white">{initials}</div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-300 mt-1 capitalize">{user?.role?.replace('_',' ')} · {user?.company?.name}</p>
          </div>
        </div>
        <form onSubmit={hsp(profileMut.mutate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Job Title</label>
              <input {...rp('jobTitle')} className="input-field" placeholder="e.g. Senior Developer"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Designation</label>
              <input {...rp('designation')} className="input-field" placeholder="e.g. Team Lead"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Contact Number</label>
            <input {...rp('contactNumber')} className="input-field" placeholder="+91 98765 43210"/>
          </div>
          <button type="submit" disabled={isp} className="btn-primary">
            {isp ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="card p-7">
        <h3 className="font-display font-bold text-[16px] mb-6">Change Password</h3>
        <form onSubmit={hsc(passMut.mutate)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Current Password</label>
            <input {...rc('currentPassword',{required:'Required'})} type="password" className="input-field" placeholder="Current password"/>
            {ec.currentPassword && <p className="text-red-500 text-xs mt-1">{ec.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">New Password</label>
            <input {...rc('newPassword',{required:'Required',minLength:{value:8,message:'Min 8 chars'}})} type="password" className="input-field" placeholder="Min 8 characters"/>
            {ec.newPassword && <p className="text-red-500 text-xs mt-1">{ec.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Confirm New Password</label>
            <input {...rc('confirm',{validate:v=>v===watch('newPassword')||'Passwords do not match'})} type="password" className="input-field" placeholder="Repeat new password"/>
            {ec.confirm && <p className="text-red-500 text-xs mt-1">{ec.confirm.message}</p>}
          </div>
          <button type="submit" disabled={isc} className="btn-primary">
            {isc ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="card p-7 border-red-100">
        <h3 className="font-display font-bold text-[16px] text-red-600 mb-2">Sign Out</h3>
        <p className="text-sm text-gray-400 mb-4">You'll need to sign in again to access your workspace.</p>
        <button onClick={logout} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition-all">Sign Out</button>
      </motion.div>
    </div>
  );
}
