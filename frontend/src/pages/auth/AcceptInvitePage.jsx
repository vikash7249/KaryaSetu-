import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

export function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.acceptInvite(token, data);
      localStorage.setItem('ks_token', res.token);
      useAuthStore.setState({ user: res.user, token: res.token, isAuthenticated: true });
      toast.success('Welcome to KaryaSetu!');
      navigate('/force-password');
    } catch (err) {
      toast.error(err.message || 'Invalid invitation');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="11" y="8" width="6" height="9" rx="1.5" fill="rgba(255,255,255,0.8)"/>
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-gray-900">Accept Invitation</h2>
          <p className="text-gray-400 text-sm mt-1">Enter your name to join the workspace</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Your Full Name</label>
            <input {...register('name', { required: 'Name required' })} className="input-field" placeholder="Rahul Sharma" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center py-3">
            {isSubmitting ? 'Joining...' : 'Join Workspace →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export function ForcePasswordPage() {
  const { changePassword } = authAPI;
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const store = useAuthStore();

  const onSubmit = async (data) => {
    try {
      const res = await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      localStorage.setItem('ks_token', res.token);
      store.updateUser({ isFirstLogin: false });
      toast.success('Password changed! Welcome!');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err.message || 'Password change failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Set New Password</h2>
        <p className="text-gray-400 text-sm mb-6">Please change your temporary password to continue</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Temporary Password</label>
            <input {...register('currentPassword', { required: true })} type="password" className="input-field" placeholder="From invitation email" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">New Password</label>
            <input {...register('newPassword', { required: true, minLength: { value: 8, message: 'Min 8 chars' } })} type="password" className="input-field" placeholder="Min 8 characters" />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Confirm Password</label>
            <input {...register('confirm', { validate: (v) => v === watch('newPassword') || 'Passwords do not match' })} type="password" className="input-field" placeholder="Repeat new password" />
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center py-3">
            {isSubmitting ? 'Saving...' : 'Set Password & Continue →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default AcceptInvitePage;
