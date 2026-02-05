const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })
  : null;

const from = process.env.MAIL_FROM || 'noreply@example.com';
const appName = process.env.APP_NAME || 'Rewards';

/**
 * Send magic-link email for customer login via AWS SES.
 * If AWS is not configured, logs the link in development only.
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

  if (ses) {
    try {
      await ses.send(
        new SendEmailCommand({
          Source: from,
          Destination: { ToAddresses: [to] },
          Message: {
            Subject: { Data: `Sign in to ${appName}`, Charset: 'UTF-8' },
            Body: {
              Text: { Data: text, Charset: 'UTF-8' },
              Html: { Data: html, Charset: 'UTF-8' }
            }
          }
        })
      );
      return true;
    } catch (err) {
      console.error('[Mailer] Send failed:', err.message || err);
      return false;
    }
  }
  // Development: log the link so you can test without AWS
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Mailer] Magic link (AWS SES not configured):', loginLink);
    return true;
  }
  return false;
}

module.exports = { sendMagicLink };
