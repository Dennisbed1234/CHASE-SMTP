// lib/otp.js
const crypto = require("crypto");
const { getPool } = require("./db");

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

async function createOtp(email) {
  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // valid 10 minutes

  const pool = getPool();
  await pool.query(
    `INSERT INTO otp_codes (email, code_hash, expires_at) VALUES ($1, $2, $3)`,
    [email, codeHash, expiresAt]
  );

  return code;
}

async function verifyOtp(email, code) {
  const pool = getPool();
  const codeHash = hashCode(code);

  const { rows } = await pool.query(
    `SELECT id FROM otp_codes
     WHERE email = $1 AND code_hash = $2 AND used = false AND expires_at > now()
     ORDER BY created_at DESC LIMIT 1`,
    [email, codeHash]
  );

  if (rows.length === 0) {
    return { valid: false };
  }

  await pool.query(`UPDATE otp_codes SET used = true WHERE id = $1`, [rows[0].id]);
  return { valid: true };
}

module.exports = { createOtp, verifyOtp };
