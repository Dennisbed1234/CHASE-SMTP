const nodemailer = require('nodemailer');

let transporter = null;

function extractEmail(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  const angle = s.match(/<([^>]+@[^>]+)>/);
  if (angle) return angle[1].trim().toLowerCase();
  const plain = s.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return plain ? plain[0].toLowerCase() : s.includes('@') ? s.toLowerCase() : '';
}

function getMailConfig() {
  // Prefer Zoho vars (legacy CHASE), fall back to generic SMTP_*
  const user =
    extractEmail(process.env.ZOHO_EMAIL || process.env.SMTP_USER || '') || '';
  const pass = String(
    process.env.ZOHO_APP_PASS || process.env.SMTP_PASS || ''
  ).replace(/\s+/g, '');
  const host = (process.env.SMTP_HOST || 'smtp.zoho.com').trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const fromEmail =
    extractEmail(process.env.MAIL_FROM || '') || user;
  const fromName =
    process.env.ZOHO_FROM_NAME ||
    process.env.MAIL_FROM_NAME ||
    'CHASE';
  return { user, pass, host, port, fromEmail, fromName };
}

function isMailConfigured() {
  const { user, pass } = getMailConfig();
  return Boolean(user && pass);
}

function getTransporter() {
  if (transporter) return transporter;
  const { user, pass, host, port } = getMailConfig();
  if (!user || !pass) {
    throw new Error('SMTP not configured (ZOHO_EMAIL + ZOHO_APP_PASS or SMTP_*)');
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
  });
  return transporter;
}

function personalize(template, vars) {
  return String(template || '').replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function sendEmail({ to, subject, html, text, fromName, attachments }) {
  if (!isMailConfigured()) {
    return { success: false, error: 'Missing ZOHO_EMAIL/ZOHO_APP_PASS or SMTP credentials' };
  }
  try {
    const cfg = getMailConfig();
    const t = getTransporter();
    const name = fromName || cfg.fromName;
    const from = name ? `"${name}" <${cfg.fromEmail}>` : cfg.fromEmail;
    const recipients = Array.isArray(to) ? to.join(', ') : to;
    const info = await t.sendMail({
      from,
      to: recipients,
      subject,
      html: html || undefined,
      text: text || (html ? stripHtml(html) : '.'),
      replyTo: cfg.fromEmail,
      attachments,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function verifyConnection() {
  if (!isMailConfigured()) {
    return { success: false, error: 'SMTP not configured' };
  }
  try {
    await getTransporter().verify();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function sendDelayMs() {
  const base = parseInt(process.env.SMTP_SEND_DELAY_MS || '150', 10);
  if (!Number.isFinite(base) || base <= 0) return 0;
  return base + Math.floor(Math.random() * Math.min(150, base));
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  sendEmail,
  verifyConnection,
  isMailConfigured,
  getMailConfig,
  personalize,
  sendDelayMs,
  delay,
};
