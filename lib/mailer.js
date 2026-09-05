// lib/mailer.js
// Zoho SMTP mailer core. Used by the API routes in app/api/.

const nodemailer = require("nodemailer");

const ZOHO_EMAIL = process.env.ZOHO_EMAIL;
const ZOHO_APP_PASS = process.env.ZOHO_APP_PASS;
const ZOHO_FROM_NAME = process.env.ZOHO_FROM_NAME || "";

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false,
    auth: {
      user: ZOHO_EMAIL,
      pass: ZOHO_APP_PASS,
    },
  });
}

function stripHtml(html = "") {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, "")
    .replace(/<script[^>]*>.*?<\/script>/gs, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!ZOHO_EMAIL || !ZOHO_APP_PASS) {
    return {
      success: false,
      error: "Missing ZOHO_EMAIL or ZOHO_APP_PASS environment variables.",
    };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: ZOHO_FROM_NAME ? `"${ZOHO_FROM_NAME}" <${ZOHO_EMAIL}>` : ZOHO_EMAIL,
      to,
      subject,
      html,
      text: text || stripHtml(html),
      replyTo: replyTo || ZOHO_EMAIL,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function verifyConnection() {
  if (!ZOHO_EMAIL || !ZOHO_APP_PASS) {
    return {
      success: false,
      error: "Missing ZOHO_EMAIL or ZOHO_APP_PASS environment variables.",
    };
  }
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail, verifyConnection, ZOHO_EMAIL };
