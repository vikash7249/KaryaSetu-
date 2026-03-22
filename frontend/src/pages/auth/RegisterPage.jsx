import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import useAuthStore from '../../context/authStore';

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: regUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await regUser(data);
    if (result.success) navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[#0D0D14] px-16 relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-brand-400/10 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-sm">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-brand-400 rounded-2xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="6" height="6" rx="1.5" fill="white"/>
                <rect x="11" y="8" width="6" height="9" rx="1.5" fill="rgba(255,255,255,0.8)"/>
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-white">Karya<span className="text-brand-300">Setu</span></span>
          </Link>
          <h2 className="font-display text-3xl font-extrabold text-white mb-4 leading-tight">Your AI Manager<br />starts here.</h2>
          <p className="text-white/40 leading-relaxed mb-10">Set up your company workspace in 2 minutes. Domain-locked. AI-powered from day one.</p>
          <div className="space-y-4">
            {[
              { icon: '✦', title: 'AI Project Planner', desc: 'Describe a project, get full plan' },
              { icon: '🔒', title: 'Domain Security',   desc: 'Only your team can access' },
              { icon: '🚀', title: 'Free to start',     desc: '5 users, 3 projects, forever free' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
                <span className="text-brand-300 text-sm flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-white/80 text-sm font-semibold">{item.title}</p>
                  <p className="text-white/35 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center px-6 py-12 bg-white">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm">
          <h3 className="font-display text-2xl font-extrabold text-gray-900 mb-1">Create workspace</h3>
          <p className="text-gray-400 text-sm mb-8">Set up your company's AI Work OS</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Your Full Name</label>
              <input {...register('name', { required: 'Name required' })} className="input-field" placeholder="Rahul Sharma" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Work Email</label>
              <input {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Valid email needed' } })}
                type="email" className="input-field" placeholder="rahul@yourcompany.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Company Name</label>
              <input {...register('companyName', { required: 'Company name required' })} className="input-field" placeholder="Acme Technologies" />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Company Domain</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20">
                <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">@</span>
                <input {...register('companyDomain', { required: 'Domain required' })} className="flex-1 px-3 py-3 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none" placeholder="yourcompany.com" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Only emails from this domain can join your workspace</p>
              {errors.companyDomain && <p className="text-red-500 text-xs mt-1">{errors.companyDomain.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Password</label>
              <input {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                type="password" className="input-field" placeholder="Min. 8 characters" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary justify-center py-3.5 text-[15px] mt-2">
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create Workspace <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account? <Link to="/login" className="text-brand-400 font-semibold">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
