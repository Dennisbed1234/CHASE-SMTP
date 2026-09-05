// app/api/health/route.js
const { verifyConnection, ZOHO_EMAIL } = require("../../../lib/mailer");

export async function GET() {
  const result = await verifyConnection();
  return Response.json({
    connected: result.success,
    sender: ZOHO_EMAIL || null,
    error: result.success ? null : result.error,
  });
}
