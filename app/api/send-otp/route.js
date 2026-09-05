// app/api/send-otp/route.js
const { createOtp } = require("../../../lib/otp");
const { sendEmail } = require("../../../lib/mailer");

export async function POST(request) {
  const { to } = await request.json();

  if (!to) {
    return Response.json(
      { success: false, error: "Missing recipient email." },
      { status: 400 }
    );
  }

  try {
    const code = await createOtp(to);

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a;">
        <p style="margin: 0 0 12px;">Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 0 0 12px;">${code}</p>
        <p style="color: #666; font-size: 13px; margin: 0;">This code expires in 10 minutes.</p>
      </div>
    `;

    const result = await sendEmail({
      to,
      subject: "Your verification code",
      html,
    });

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
