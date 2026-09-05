# CHASE-SMTP

A small, reusable Node.js module for sending emails through Zoho Mail's SMTP servers — no separate email provider (SendGrid/Resend) required.

## Setup

1. **Generate a Zoho App Password**
   Zoho Mail → Settings → Security → App Passwords → generate one for this app.
   (Do not use your normal Zoho login password — it won't work for SMTP.)

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
   Copy `.env.example` to `.env` and fill in your Zoho address + app password.
   In Next.js, add the same variables in your Vercel project's Environment Variables settings.

4. **Test it**
   ```bash
   node example.js
   ```
   This checks the SMTP connection, then sends a test email to whatever address you put in `example.js`.

## Using it in your app

Import `sendEmail` from `mailer.js` anywhere in your Node.js/Next.js code:

```js
const { sendEmail } = require("./mailer");

await sendEmail({
  to: "customer@example.com",
  subject: "Welcome!",
  html: "<h1>Hello there</h1>",
});
```

See `nextjs-api-route-example.js` for a ready-to-drop-in API route.

## Known limits (Zoho free tier)

- Roughly **25 emails/hour** on Zoho's free plan — fine for transactional email at small scale, tight for bulk sends to all users at once.
- No domain authentication (SPF/DKIM/DMARC) beyond what Zoho already provides for its own domain — deliverability is decent but capped below what a fully authenticated custom domain would give you.
- If you outgrow this, the same `sendEmail` interface can be swapped to call SendGrid/Resend's API instead — the rest of your app doesn't need to change.

## Recommended next step

Log every send (recipient, subject, status, timestamp) to a Postgres table (Neon works well) so you can track deliveries and retries. Ask if you want that added — it's a small addition on top of this.


