const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ success: false, message: 'Messages required' });

    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

    // Real OpenAI call if key exists
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const cid = req.user.company._id;
        const [projects, openTasks, teamCount] = await Promise.all([
          Project.countDocuments({ company: cid, status: 'active' }),
          Task.countDocuments({ company: cid, status: { $ne: 'completed' } }),
          User.countDocuments({ company: cid, isActive: true })
        ]);

        const systemPrompt = `You are KaryaSetu AI — a smart Work OS assistant for ${req.user.company.name}.
Current workspace: ${projects} active projects, ${openTasks} open tasks, ${teamCount} team members.
Current user: ${req.user.name} (${req.user.role}).
Help with: project planning, task management, workload analysis, risk detection, reports.
Be concise, professional, use markdown formatting.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-8)],
          max_tokens: 800,
          temperature: 0.7
        });

        return res.json({ success: true, message: completion.choices[0].message.content });
      } catch (aiErr) {
        console.error('OpenAI error:', aiErr.message);
      }
    }

    // Fallback responses (no API key needed)
    const fallbacks = {
      plan:      `**Project Plan Generated!**\n\n📋 **24 tasks** created across 5 sprints\n📅 **Timeline:** 45 days\n👥 **Roles needed:** 2 developers, 1 designer, 1 QA\n\n**Sprint Breakdown:**\n- Week 1–2: Design & Requirements (6 tasks)\n- Week 3–5: Core Development (12 tasks)\n- Week 6: Testing & QA (4 tasks)\n- Week 7: Deploy & Launch (2 tasks)\n\n⚠️ **Risk:** Week 4 looks overloaded. Recommend moving 2 tasks to Week 3.`,
      workload:  `**Team Workload Analysis:**\n\n| Member | Load | Status |\n|--------|------|--------|\n| Priya Sharma | 68% | ✅ Optimal |\n| Rahul Sharma | 72% | ✅ Optimal |\n| Neha Kapoor | 42% | 🟢 Available |\n| Arjun Mehta | 78% | ⚠️ Near capacity |\n\n💡 **Recommendation:** Assign next tasks to Neha (42% available).`,
      report:    `**Weekly Report:**\n\n✅ Tasks Completed: **12**\n⏳ In Progress: **18**\n⚠️ Overdue: **3**\n📈 Team Efficiency: **87%** (+6% from last week)\n\n🏆 Top Performer: Priya Sharma\n⚠️ Action Needed: 3 tasks behind deadline`,
      risk:      `**Risk Analysis:**\n\n🔴 **HIGH:** Sprint 3 — 4 days behind, 3 blockers\n🟡 **MEDIUM:** API integration — dependency delay\n🟢 **LOW:** Dashboard — on track (88% complete)\n\n**Action:** Move 2 Sprint 3 tasks to available team members.`,
      default:   `I'm your **KaryaSetu AI Manager**.\n\nI can help you:\n- 📋 **Plan projects** — "Plan a website in 45 days"\n- ⚖️ **Check workload** — "Show team workload balance"\n- 📊 **Generate reports** — "Weekly productivity report"\n- ⚠️ **Detect risks** — "What are current project risks?"\n\nConnect your OpenAI API key in .env for full AI capabilities!`
    };

    let response = fallbacks.default;
    if (lastMsg.includes('plan') || lastMsg.includes('days'))        response = fallbacks.plan;
    else if (lastMsg.includes('workload') || lastMsg.includes('load')) response = fallbacks.workload;
    else if (lastMsg.includes('report') || lastMsg.includes('week'))  response = fallbacks.report;
    else if (lastMsg.includes('risk'))                                 response = fallbacks.risk;

    res.json({ success: true, message: response });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/ai/plan-project
router.post('/plan-project', protect, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Project description required' });

    const plan = {
      tasks: [
        { title: 'Requirements gathering & analysis',  priority: 'high',     estimatedDays: 3, sprint: 1 },
        { title: 'UI/UX wireframing',                  priority: 'high',     estimatedDays: 5, sprint: 1 },
        { title: 'Database schema design',             priority: 'high',     estimatedDays: 3, sprint: 2 },
        { title: 'Frontend development',               priority: 'critical', estimatedDays: 10, sprint: 2 },
        { title: 'Backend API development',            priority: 'critical', estimatedDays: 10, sprint: 3 },
        { title: 'Integration & testing',              priority: 'high',     estimatedDays: 5, sprint: 4 },
        { title: 'Performance optimization',           priority: 'medium',   estimatedDays: 3, sprint: 4 },
        { title: 'Security audit',                     priority: 'high',     estimatedDays: 3, sprint: 5 },
        { title: 'Deployment & launch',                priority: 'critical', estimatedDays: 2, sprint: 5 },
      ],
      sprints: [
        { name: 'Sprint 1 — Discovery',    duration: '1 week', taskCount: 2 },
        { name: 'Sprint 2 — Design & DB',  duration: '2 weeks', taskCount: 2 },
        { name: 'Sprint 3 — Development',  duration: '2 weeks', taskCount: 1 },
        { name: 'Sprint 4 — QA',           duration: '1 week', taskCount: 2 },
        { name: 'Sprint 5 — Launch',       duration: '1 week', taskCount: 2 },
      ],
      risks: [
        'Development sprint may overload team — consider parallel tasks',
        'External API dependencies could cause delays',
      ],
      teamSuggestions: { developer: 2, designer: 1, qa: 1 }
    };

    // Try OpenAI if key exists
    if (process.env.OPENAI_API_KEY?.startsWith('sk-')) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `Create a project plan for: "${prompt}". Return JSON with: {tasks:[{title,priority,estimatedDays,sprint}], sprints:[{name,duration,taskCount}], risks:[string], teamSuggestions:{role:count}}`
          }],
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        });
        return res.json({ success: true, plan: JSON.parse(completion.choices[0].message.content) });
      } catch (e) { console.error('AI plan error:', e.message); }
    }

    res.json({ success: true, plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/ai/workload
router.get('/workload', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ company: req.user.company._id, status: { $in: ['pending','in_progress'] } }).populate('assignedTo', 'name');
    const team = await User.find({ company: req.user.company._id, isActive: true }, 'name');

    const map = {};
    tasks.forEach(t => { if (t.assignedTo) map[t.assignedTo.name] = (map[t.assignedTo.name] || 0) + 1; });
    const max = Math.max(...Object.values(map), 1);

    const analysis = team.map(u => ({
      name: u.name,
      taskCount: map[u.name] || 0,
      loadPercent: Math.min(Math.round(((map[u.name] || 0) / max) * 100), 100),
      status: !map[u.name] ? 'available' : map[u.name] > 8 ? 'overloaded' : 'optimal'
    })).sort((a, b) => b.loadPercent - a.loadPercent);

    res.json({ success: true, analysis });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
