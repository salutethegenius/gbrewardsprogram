const nodemailer = require('nodemailer');

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
    })
  : null;

const from = process.env.MAIL_FROM || 'noreply@example.com';
const appName = process.env.APP_NAME || 'Rewards';

/**
 * Send magic-link email for customer login. If SMTP is not configured, logs the link (dev only).
 * @param {string} to - Email address
 * @param {string} loginLink - Full URL to open (e.g. https://app.com/customer/verify?token=xxx)
 * @returns {Promise<boolean>} - true if sent or logged
 */
async function sendMagicLink(to, loginLink) {
  const html = `
    <p>Use this link to sign in to your ${appName} account:</p>
    <p><a href="${loginLink}" style="word-break: break-all;">${loginLink}</a></p>
    <p>This link expires in 15 minutes. If you didn't request it, you can ignore this email.</p>
  `;
  const text = `Sign in to ${appName}: ${loginLink}\n\nThis link expires in 15 minutes.`;

  if (transporter) {
    await transporter.sendMail({
      from,
      to,
      subject: `Sign in to ${appName}`,
      text,
      html
    });
    return true;
  }
  // Development: log the link so you can test without SMTP
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Mailer] Magic link (SMTP not configured):', loginLink);
    return true;
  }
  return false;
}

module.exports = { sendMagicLink };
