// example.js
// Run with: node example.js
// Make sure ZOHO_EMAIL and ZOHO_APP_PASS are set (see .env.example)

const { sendEmail, verifyConnection } = require("./mailer");

async function main() {
  // 1. Optional: check the connection/credentials first
  const check = await verifyConnection();
  console.log("Connection check:", check);

  if (!check.success) {
    console.log("Fix your Zoho credentials before sending.");
    return;
  }

  // 2. Send a test email
  const result = await sendEmail({
    to: "recipient@example.com",
    subject: "Hello from your Zoho SMTP mailer",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>It works! 🎉</h2>
        <p>This email was sent through your own Node.js + Zoho SMTP setup.</p>
      </div>
    `,
  });

  console.log("Send result:", result);
}

main();
