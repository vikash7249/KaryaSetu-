const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, template, data }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL SKIP] To: ${to} | Subject: ${subject}`);
      return { success: true, skipped: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const templates = {
      invitation: (d) => `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff">
          <h2 style="color:#5D4EED">You're invited to KaryaSetu!</h2>
          <p>Hi! <strong>${d.inviterName}</strong> has invited you to join <strong>${d.companyName}</strong>.</p>
          <p><strong>Your login:</strong><br>
          Email: ${d.email}<br>
          Temp Password: <code style="background:#f0f0f0;padding:4px 8px;border-radius:4px">${d.tempPassword}</code></p>
          <a href="${d.acceptUrl}" style="display:inline-block;background:#5D4EED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Accept Invitation</a>
          <p style="color:#999;font-size:12px;margin-top:24px">This link expires in 7 days.</p>
        </div>`,
      welcome: (d) => `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff">
          <h2 style="color:#5D4EED">Welcome to KaryaSetu, ${d.name}!</h2>
          <p>Your workspace <strong>${d.companyName}</strong> is ready.</p>
          <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#5D4EED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">Open Dashboard</a>
        </div>`
    };

    const emailHtml = template && templates[template] ? templates[template](data) : html;

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'KaryaSetu'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to, subject,
      html: emailHtml
    });

    console.log(`[EMAIL SENT] To: ${to}`);
    return { success: true };
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail };
