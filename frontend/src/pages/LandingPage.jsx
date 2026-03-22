import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, Shield, Zap, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

const PLANS = [
  { name:'Free',     price:'₹0',    period:'forever', features:['5 users','3 projects','Basic tasks','Kanban board'],                         cta:'Start Free', popular:false },
  { name:'Starter',  price:'₹999',  period:'/month',  features:['20 users','Unlimited projects','AI suggestions','Time tracking'],             cta:'Start Trial',popular:false },
  { name:'Business', price:'₹2,999',period:'/month',  features:['100 users','Full AI Suite','AI Planner','Risk detection','Auto reports','Gamification','WhatsApp alerts'],cta:'Start Trial',popular:true },
  { name:'Enterprise',price:'Custom',period:'',        features:['Unlimited users','Custom domain','SSO','Dedicated server','White labelling'], cta:'Contact Sales',popular:false },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="bg-white font-body overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" fill="white"/><rect x="11" y="8" width="6" height="9" rx="1.5" fill="rgba(255,255,255,0.8)"/></svg>
            </div>
            <span className="font-display font-bold text-[18px] text-gray-900">Karya<span className="text-brand-400">Setu</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features','Pricing','FAQ'].map(x => <a key={x} href={`#${x.toLowerCase()}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{x}</a>)}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 hidden sm:block">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5">Start Free <ArrowRight size={13}/></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(93,78,237,0.1)_0%,transparent_60%)]"/>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-full text-sm font-semibold text-brand-600 mb-8">
            <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"/>
            AI Work OS · Built for Indian Teams
          </motion.div>
          <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="font-display text-[52px] sm:text-[64px] leading-[1.05] font-extrabold text-gray-900 mb-6 tracking-tight">
            Your Company's<br/><span className="text-brand-400">AI Manager</span>, Always On.
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            KaryaSetu replaces Jira, Zoho & ClickUp. AI plans projects, assigns tasks, tracks progress and sends reports — automatically.
          </motion.p>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/register" className="btn-primary text-base py-3.5 px-8">Start Free — No Card Needed <ArrowRight size={16}/></Link>
            <Link to="/app/dashboard" className="btn-secondary text-base py-3.5 px-8">View Live Demo</Link>
          </motion.div>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Free 5-user plan','Setup in 2 min','AI built-in','No training needed'].map(x => (
              <div key={x} className="flex items-center gap-2 text-sm text-gray-400"><Check size={14} className="text-green-500"/>{x}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">⚡ Features</div>
            <h2 className="font-display text-[40px] font-extrabold text-gray-900 leading-tight mb-4">Everything your team needs.</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">No 200-page manual. No week-long onboarding. Just open and go.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon:Sparkles,title:'AI Project Planner',      desc:'Type your goal. AI creates tasks, timeline, assigns roles in 10 seconds.',   dark:true  },
              { icon:Zap,      title:'Smart Workload Balancer', desc:'AI monitors capacity and redistributes work. No more overloaded employees.'           },
              { icon:BarChart3,title:'Productivity Intelligence',desc:'Track completion time, delays, rework. Know who performs — in real time.'           },
              { icon:Shield,   title:'Domain-Locked Security',  desc:'Only @yourcompany.com emails can access. Zero config, maximum security.'            },
              { icon:Sparkles, title:'Auto Weekly Reports',     desc:'Every Monday, full performance report in your inbox. Zero effort.'                   },
              { icon:Zap,      title:'Zero-Training UI',        desc:'So intuitive, new hires start working day one. No manual, no excuses.'               },
            ].map((f,i) => (
              <motion.div key={f.title} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}}
                className={clsx('rounded-2xl p-7 border transition-all hover:-translate-y-0.5', f.dark ? 'bg-[#0D0D14] border-gray-800' : 'bg-white border-gray-100 hover:border-brand-200 hover:shadow-md')}>
                <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center mb-5', f.dark ? 'bg-brand-400/20' : 'bg-brand-50')}>
                  <f.icon size={20} className={f.dark ? 'text-brand-400' : 'text-brand-400'}/>
                </div>
                <h3 className={clsx('font-display font-bold text-[17px] mb-2', f.dark ? 'text-white' : 'text-gray-900')}>{f.title}</h3>
                <p className={clsx('text-sm leading-relaxed', f.dark ? 'text-white/50' : 'text-gray-500')}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">💰 Pricing</div>
            <h2 className="font-display text-[40px] font-extrabold text-gray-900 mb-4">Simple pricing. Serious results.</h2>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
            {PLANS.map((p,i) => (
              <motion.div key={p.name} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}}
                className={clsx('rounded-2xl p-8 flex flex-col relative', p.popular ? 'bg-brand-400 text-white shadow-2xl scale-[1.02]' : 'bg-white border border-gray-100')}>
                {p.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap">🔥 Most Popular</div>}
                <div className={clsx('text-xs font-bold uppercase tracking-widest mb-2', p.popular ? 'text-brand-200' : 'text-gray-400')}>{p.name}</div>
                <div className={clsx('font-display text-4xl font-extrabold leading-none mb-1', p.popular ? 'text-white' : 'text-gray-900')}>{p.price}</div>
                <div className={clsx('text-sm mb-6', p.popular ? 'text-brand-200' : 'text-gray-400')}>{p.period}</div>
                <div className={clsx('border-t mb-6', p.popular ? 'border-brand-300/50' : 'border-gray-100')}/>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map(f => (
                    <li key={f} className={clsx('flex items-center gap-2.5 text-sm', p.popular ? 'text-brand-100' : 'text-gray-600')}>
                      <Check size={14} className={p.popular ? 'text-brand-200 flex-shrink-0' : 'text-green-500 flex-shrink-0'}/>{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={clsx('w-full py-3 rounded-xl font-semibold text-sm text-center transition-all', p.popular ? 'bg-white text-brand-500 hover:bg-brand-50' : 'border-2 border-gray-200 hover:border-brand-400 hover:text-brand-500 text-gray-700')}>
                  {p.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-[40px] font-extrabold text-gray-900">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q:'How does domain security work?', a:'When you register, you provide your domain (e.g., techcorp.com). Only @techcorp.com emails can access your workspace. All other attempts are rejected automatically.' },
              { q:'Can I migrate from Jira or ClickUp?', a:'Yes! CSV import supported from Jira, ClickUp, Asana, and Trello. Most teams complete migration in under 2 hours.' },
              { q:'Do I need OpenAI key for AI features?', a:'The app works with fallback AI responses without an OpenAI key. For full AI power (GPT-4 responses), add your key in the .env file.' },
              { q:'Can employees upload files?', a:'No. By design, only Project Managers and Admins can upload files. Employees can only view and download. This maintains document integrity.' },
            ].map((f,i) => (
              <div key={i} className={clsx('bg-white rounded-2xl border overflow-hidden transition-all', openFaq===i ? 'border-brand-200 shadow-sm' : 'border-gray-100')}>
                <button onClick={() => setOpenFaq(openFaq===i?null:i)} className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-[15px] text-gray-900">{f.q}</span>
                  <span className={clsx('text-gray-400 transition-transform text-xl', openFaq===i && 'rotate-45')}>+</span>
                </button>
                <div className={clsx('overflow-hidden transition-all duration-300', openFaq===i ? 'max-h-40' : 'max-h-0')}>
                  <p className="px-7 pb-6 text-sm text-gray-500 leading-relaxed">{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-brand-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,transparent_60%)]"/>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="font-display text-[44px] font-extrabold text-white mb-4">Ready to run your company on AI?</h2>
          <p className="text-brand-200 text-xl mb-10 max-w-2xl mx-auto">Free to start. Powerful from day one.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-brand-500 hover:bg-brand-50 font-bold py-4 px-10 rounded-2xl text-base transition-all flex items-center gap-2 justify-center">Start Free Today <ArrowRight size={16}/></Link>
            <Link to="/app/dashboard" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-2xl text-base transition-all">View Demo</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0D14] text-white/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-400 rounded-xl flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" fill="white"/><rect x="11" y="8" width="6" height="9" rx="1.5" fill="rgba(255,255,255,0.8)"/></svg></div>
            <span className="font-display font-bold text-white text-[16px]">KaryaSetu</span>
          </div>
          <p className="text-xs">© 2025 KaryaSetu. Built with ❤️ in India 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
