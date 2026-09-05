// Example: app/api/send-email/route.js  (Next.js App Router)
// or pages/api/send-email.js (Pages Router, adjust export style)

import { sendEmail } from "../../../mailer"; // adjust path to where mailer.js lives

export async function POST(request) {
  const { to, subject, html, text } = await request.json();

  if (!to || !subject || !html) {
    return Response.json(
      { error: "Missing required fields: to, subject, html" },
      { status: 400 }
    );
  }

  const result = await sendEmail({ to, subject, html, text });

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ success: true, messageId: result.messageId });
}

/*
Usage from your frontend or another server function:

await fetch("/api/send-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "customer@example.com",
    subject: "Welcome!",
    html: "<h1>Welcome to our service</h1>",
  }),
});
*/
