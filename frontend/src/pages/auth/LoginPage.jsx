import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuthStore from '../../context/authStore';

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) navigate(result.isFirstLogin ? '/force-password' : '/app/dashboard');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#0D0D14] px-16 relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-brand-400/10 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center max-w-sm">
          <Link to="/" className="flex items-center gap-3 justify-center mb-12">
            <div className="w-10 h-10 bg-brand-400 rounded-2xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="6" height="6" rx="1.5" fill="white"/>
                <rect x="11" y="8" width="6" height="9" rx="1.5" fill="rgba(255,255,255,0.8)"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-white">Karya<span className="text-brand-300">Setu</span></span>
          </Link>
          <h2 className="font-display text-3xl font-extrabold text-white mb-4 leading-tight">Your AI Work OS<br />is waiting.</h2>
          <p className="text-white/40 leading-relaxed">Domain-locked workspace · AI project planner · Real-time team tracking</p>
        </motion.div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center px-6 py-12 bg-white">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm">
          <h3 className="font-display text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h3>
          <p className="text-gray-400 text-sm mb-8">Sign in to your company workspace</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Work Email</label>
              <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Valid email needed' } })}
                type="email" className="input-field" placeholder="you@company.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-gray-600">Password</label>
              </div>
              <div className="relative">
                <input {...register('password', { required: 'Password required' })}
                  type={show ? 'text' : 'password'} className="input-field pr-11" placeholder="Your password" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary justify-center py-3.5 text-[15px] mt-2">
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            No account? <Link to="/register" className="text-brand-400 font-semibold hover:text-brand-500">Create workspace</Link>
          </p>
          <div className="mt-6 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <p className="text-xs text-gray-400">🔒 Only <strong className="text-gray-600">@yourcompany.com</strong> emails can access your workspace</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
