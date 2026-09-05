// app/api/send-email/route.js
const { sendEmail } = require("../../../lib/mailer");

export async function POST(request) {
  const body = await request.json();
  const { to, subject, message, html, isHtml, attachments } = body;

  if (!to || !subject || (!message && !html)) {
    return Response.json(
      { success: false, error: "Missing to, subject, and message or html." },
      { status: 400 }
    );
  }

  // If isHtml is true, treat `message` as a ready-made HTML template.
  // Otherwise wrap plain text in a basic HTML shell.
  const finalHtml =
    html ||
    (isHtml
      ? message
      : `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <p>${message.replace(/\n/g, "<br/>")}</p>
    </div>
  `);

  const preparedAttachments = Array.isArray(attachments)
    ? attachments
        .filter((a) => a && a.content && a.filename)
        .map((a) => ({
          filename: a.filename,
          content: a.content, // base64 string
          encoding: "base64",
          contentType: a.contentType || undefined,
        }))
    : undefined;

  const result = await sendEmail({
    to,
    subject,
    html: finalHtml,
    attachments: preparedAttachments && preparedAttachments.length ? preparedAttachments : undefined,
  });

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: 500 });
  }

  return Response.json({ success: true, messageId: result.messageId });
}
