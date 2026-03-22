const User = require('../models/User');
const Task = require('../models/Task');

// Badge definitions
const BADGES = [
  {
    name: 'First Win',
    icon: '🎯',
    check: async (userId) => {
      const done = await Task.countDocuments({ assignedTo: userId, status: 'completed' });
      return done >= 1;
    }
  },
  {
    name: 'Speed Demon',
    icon: '⚡',
    check: async (userId) => {
      // Completed 5 tasks before due date
      const onTime = await Task.countDocuments({
        assignedTo: userId,
        status: 'completed',
        isDelayed: false
      });
      return onTime >= 5;
    }
  },
  {
    name: 'Streak',
    icon: '🔥',
    check: async (userId) => {
      const done = await Task.countDocuments({ assignedTo: userId, status: 'completed' });
      return done >= 10;
    }
  },
  {
    name: 'Centurion',
    icon: '💯',
    check: async (userId) => {
      const done = await Task.countDocuments({ assignedTo: userId, status: 'completed' });
      return done >= 100;
    }
  },
  {
    name: 'Focus',
    icon: '🎯',
    check: async (userId) => {
      // 0 rework tasks
      const rework = await Task.countDocuments({ assignedTo: userId, reworkCount: { $gt: 0 } });
      const total  = await Task.countDocuments({ assignedTo: userId, status: 'completed' });
      return total >= 10 && rework === 0;
    }
  }
];

const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const existingBadgeNames = user.badges.map(b => b.name);
    const newBadges = [];

    for (const badge of BADGES) {
      if (existingBadgeNames.includes(badge.name)) continue;
      const earned = await badge.check(userId);
      if (earned) newBadges.push({ name: badge.name, icon: badge.icon, earnedAt: new Date() });
    }

    if (newBadges.length > 0) {
      await User.findByIdAndUpdate(userId, { $push: { badges: { $each: newBadges } } });
      console.log(`[Badges] ${user.name} earned: ${newBadges.map(b => b.name).join(', ')}`);
    }
  } catch (err) {
    console.error('[Badge check error]', err.message);
  }
};

module.exports = { checkAndAwardBadges };
