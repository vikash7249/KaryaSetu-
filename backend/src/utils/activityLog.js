const ActivityLog = require('../models/ActivityLog');

const log = async ({ company, user, action, entity, entityId, entityName, details, req }) => {
  try {
    await ActivityLog.create({
      company,
      user,
      action,
      entity,
      entityId,
      entityName,
      details,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || ''
    });
  } catch (err) {
    // Non-blocking — never crash app due to logging failure
    console.error('[ActivityLog Error]', err.message);
  }
};

module.exports = { log };
