import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, FileText, Users, BarChart3, AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import { aiAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const QUICK = [
  { icon: FileText,    label:'Plan new project',        prompt:'Plan a website redesign in 45 days' },
  { icon: Users,       label:'Check workload balance',  prompt:'Show current workload for all team members' },
  { icon: BarChart3,   label:'Weekly report',           prompt:'Generate a weekly productivity report' },
  { icon: AlertTriangle,label:'Check project risks',   prompt:'What are current risks across all projects?' },
  { icon: Zap,         label:'Find available member',   prompt:'Who is most available for new tasks right now?' },
  { icon: RefreshCw,   label:'Suggest assignments',     prompt:'Suggest optimal task assignments based on workload' },
];

const WELCOME = {
  role:'assistant',
  content:`Hello! I'm your **KaryaSetu AI Manager**. I'm monitoring your workspace.\n\n**I can help you:**\n- 📋 Plan projects — *"Plan a mobile app in 30 days"*\n- ⚖️ Analyze workload — *"Who is available for new tasks?"*\n- 📊 Generate reports — *"Weekly productivity report"*\n- ⚠️ Detect risks — *"Current project risks?"*\n\nConnect your OpenAI key in .env for full AI power!`,
  time: new Date()
};

export default function AIAssistantPage() {
  const [msgs, setMsgs]     = useState([WELCOME]);
  const [input, setInput]   = useState('');
  const [typing, setTyping] = useState(false);
  const endRef              = useRef(null);
  const inputRef            = useRef(null);
  const { user }            = useAuthStore();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, typing]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setMsgs(p => [...p, { role:'user', content:msg, time:new Date() }]);
    setInput('');
    setTyping(true);
    try {
      const history = msgs.slice(-6).map(m => ({ role:m.role, content:m.content }));
      history.push({ role:'user', content:msg });
      const res = await aiAPI.chat(history);
      setMsgs(p => [...p, { role:'assistant', content:res.message, time:new Date() }]);
    } catch {
      setMsgs(p => [...p, { role:'assistant', content:'Sorry, I ran into an error. Please try again.', time:new Date() }]);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  const renderContent = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');

  return (
    <div className="h-[calc(100vh-108px)] flex flex-col lg:flex-row gap-5">
      {/* Chat */}
      <div className="flex-1 flex flex-col bg-[#0D0D14] rounded-2xl overflow-hidden border border-white/8 min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white"/>
          </div>
          <div>
            <h3 className="font-display font-bold text-[15px] text-white">KaryaSetu AI</h3>
            <div className="flex items-center gap-1.5 text-xs text-brand-300">
              <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse"/>
              Online · Monitoring workspace
            </div>
          </div>
          <button onClick={() => { setMsgs([WELCOME]); toast.success('Chat cleared'); }} className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors">Clear</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 min-h-0">
          {msgs.map((m, i) => (
            <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className={clsx('flex gap-3', m.role==='user' && 'flex-row-reverse')}>
              {m.role==='assistant' && (
                <div className="w-7 h-7 bg-brand-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles size={12} className="text-brand-400"/>
                </div>
              )}
              {m.role==='user' && (
                <div className="w-7 h-7 bg-brand-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 text-[11px] font-bold text-white">{user?.name?.charAt(0)||'U'}</div>
              )}
              <div className={clsx('max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                m.role==='assistant' ? 'bg-white/5 text-white/80 rounded-tl-md' : 'bg-brand-400 text-white rounded-tr-md')}>
                {m.role==='assistant'
                  ? <div dangerouslySetInnerHTML={{ __html: renderContent(m.content) }}/>
                  : m.content}
                <div className={clsx('text-[10px] mt-1.5', m.role==='assistant' ? 'text-white/20' : 'text-brand-200')}>
                  {format(new Date(m.time), 'h:mm a')}
                </div>
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="flex gap-3">
                <div className="w-7 h-7 bg-brand-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles size={12} className="text-brand-400"/>
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                  {[0,150,300].map(d => <div key={d} className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay:`${d}ms` }}/>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef}/>
        </div>

        {/* Input */}
        <div className="px-5 pb-5 pt-3 border-t border-white/6 flex-shrink-0">
          <div className="flex gap-3">
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
              placeholder="Ask: 'Plan a website in 30 days' or 'Check Sprint 3 risks'..."
              className="flex-1 bg-white/6 border border-white/10 focus:border-brand-400/50 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none transition-all"/>
            <button onClick={() => send()} disabled={!input.trim()||typing}
              className="w-11 h-11 bg-brand-400 hover:bg-brand-500 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
              <Send size={15} className="text-white"/>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:w-64 flex flex-col gap-4 flex-shrink-0">
        <div className="card p-5">
          <h3 className="font-display font-bold text-[14px] mb-4">Quick Commands</h3>
          <div className="space-y-2">
            {QUICK.map(cmd => (
              <button key={cmd.label} onClick={() => send(cmd.prompt)} disabled={typing}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-gray-50 hover:bg-brand-50 hover:border-brand-200 border border-gray-100 rounded-xl text-sm text-gray-600 hover:text-brand-600 text-left transition-all disabled:opacity-50">
                <cmd.icon size={13} className="flex-shrink-0"/>
                {cmd.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold text-[14px] mb-4">AI Activity Log</h3>
          <div className="space-y-2.5">
            {[
              { text:'Auto-generated sprint report', time:'7am today', color:'bg-brand-400' },
              { text:'Detected Sprint 3 delay risk', time:'1 hr ago',  color:'bg-amber-400' },
              { text:'Rebalanced 2 tasks to Neha',   time:'Yesterday', color:'bg-green-500' },
              { text:'Weekly email report sent',     time:'Monday',    color:'bg-brand-400' },
            ].map((item,i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                <div className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', item.color)}/>
                <div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
