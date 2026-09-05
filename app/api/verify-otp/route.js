// app/api/verify-otp/route.js
const { verifyOtp } = require("../../../lib/otp");

export async function POST(request) {
  const { to, code } = await request.json();

  if (!to || !code) {
    return Response.json(
      { success: false, error: "Missing email or code." },
      { status: 400 }
    );
  }

  try {
    const result = await verifyOtp(to, code);
    return Response.json({ success: result.valid });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
