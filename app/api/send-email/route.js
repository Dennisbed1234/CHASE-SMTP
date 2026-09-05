// app/api/send-email/route.js
const { sendEmail } = require("../../../lib/mailer");

export async function POST(request) {
  const body = await request.json();
  const { to, subject, message } = body;

  if (!to || !subject || !message) {
    return Response.json(
      { success: false, error: "Missing to, subject, or message." },
      { status: 400 }
    );
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <p>${message.replace(/\n/g, "<br/>")}</p>
    </div>
  `;

  const result = await sendEmail({ to, subject, html });

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: 500 });
  }

  return Response.json({ success: true, messageId: result.messageId });
}
