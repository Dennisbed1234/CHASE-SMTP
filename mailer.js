// mailer.js
// A small, reusable SMTP mailer built on Zoho Mail.
// Works in any Node.js app (Next.js API routes, Express, scripts, etc.)

const nodemailer = require("nodemailer");

// ---- Config (pulled from environment variables) ----
// ZOHO_EMAIL      -> your full Zoho Mail address, e.g. you@zoho.com
// ZOHO_APP_PASS   -> the app-specific password generated in
//                    Zoho Mail > Settings > Security > App Passwords
// ZOHO_FROM_NAME  -> (optional) display name shown to recipients

const ZOHO_EMAIL = process.env.ZOHO_EMAIL;
const ZOHO_APP_PASS = process.env.ZOHO_APP_PASS;
const ZOHO_FROM_NAME = process.env.ZOHO_FROM_NAME || "";

if (!ZOHO_EMAIL || !ZOHO_APP_PASS) {
  console.warn(
    "[mailer] Missing ZOHO_EMAIL or ZOHO_APP_PASS environment variables. " +
      "Set them before calling sendEmail()."
  );
}

// Nodemailer transport configured for Zoho's SMTP servers.
// Port 587 = STARTTLS (recommended). Port 465 = implicit SSL, also fine.
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587,
  secure: false, // true for port 465, false for port 587 (STARTTLS)
  auth: {
    user: ZOHO_EMAIL,
    pass: ZOHO_APP_PASS,
  },
});

/**
 * Send a single email through Zoho SMTP.
 *
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body content
 * @param {string} [options.text] - Plain-text fallback (recommended for deliverability)
 * @param {string} [options.replyTo] - Optional reply-to address
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendEmail({ to, subject, html, text, replyTo }) {
  try {
    const info = await transporter.sendMail({
      from: ZOHO_FROM_NAME ? `"${ZOHO_FROM_NAME}" <${ZOHO_EMAIL}>` : ZOHO_EMAIL,
      to,
      subject,
      html,
      text: text || stripHtml(html), // always include a plain-text version
      replyTo: replyTo || ZOHO_EMAIL,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[mailer] Send failed:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Very basic HTML-to-text fallback generator.
 * Good enough for a plain-text alternative part; swap in a proper
 * library (e.g. html-to-text) later if you want higher fidelity.
 */
function stripHtml(html = "") {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, "")
    .replace(/<script[^>]*>.*?<\/script>/gs, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Verify the SMTP connection/credentials without sending an email.
 * Useful for a health-check route or a one-off diagnostic script.
 */
async function verifyConnection() {
  try {
    await transporter.verify();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail, verifyConnection };
