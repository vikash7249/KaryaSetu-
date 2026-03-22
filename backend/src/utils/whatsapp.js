/**
 * WhatsApp notifications via Twilio WhatsApp API
 * Setup: https://www.twilio.com/docs/whatsapp/quickstart
 *
 * .env mein add karo:
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxx
 *   TWILIO_AUTH_TOKEN=your_auth_token
 *   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
 */

const sendWhatsApp = async ({ to, message }) => {
  // Skip if Twilio not configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[WhatsApp SKIP] To: ${to} | ${message}`);
    return { success: true, skipped: true };
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
      to:   `whatsapp:${to}`,
      body: message
    });

    console.log(`[WhatsApp SENT] To: ${to} SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (err) {
    console.error('[WhatsApp ERROR]', err.message);
    return { success: false, error: err.message };
  }
};

// Template messages
const templates = {
  taskAssigned: (taskTitle, projectName, dueDate) =>
    `🗂️ *KaryaSetu — New Task Assigned*\n\nTask: *${taskTitle}*\nProject: ${projectName}\nDue: ${dueDate || 'No deadline'}\n\nOpen KaryaSetu to view details.`,

  taskCompleted: (taskTitle, completedBy) =>
    `✅ *KaryaSetu — Task Completed*\n\n*${completedBy}* completed:\n"${taskTitle}"\n\nGreat work!`,

  deadlineReminder: (taskTitle, dueDate) =>
    `⏰ *KaryaSetu — Deadline Reminder*\n\nTask: *${taskTitle}*\nDue: *${dueDate}*\n\nPlease complete this task on time.`,

  aiAlert: (message) =>
    `🤖 *KaryaSetu AI Alert*\n\n${message}`
};

module.exports = { sendWhatsApp, templates };
