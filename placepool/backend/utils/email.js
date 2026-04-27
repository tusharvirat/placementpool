const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTPEmail = async (to, name, otp) => {
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8f7ff;border-radius:16px">
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;background:#7c3aed;color:#fff;width:52px;height:52px;border-radius:14px;line-height:52px;font-size:24px;font-weight:700">P</div>
      <h2 style="color:#7c3aed;margin:10px 0 4px">PlacePool</h2>
      <p style="color:#6b7280;font-size:13px;margin:0">University Placement Portal</p>
    </div>
    <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #ede9fe">
      <p style="color:#374151;font-size:15px;margin:0 0 8px">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px">Your one-time password for PlacePool is:</p>
      <div style="text-align:center;background:#f8f7ff;border-radius:10px;padding:20px;margin-bottom:20px">
        <span style="font-size:38px;font-weight:700;letter-spacing:12px;color:#7c3aed">${otp}</span>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">Valid for <strong>10 minutes</strong>. Do not share this with anyone.</p>
    </div>
    <p style="color:#d1d5db;font-size:11px;text-align:center;margin-top:16px">PlacePool · University Placement Cell</p>
  </div>`;

  const { error } = await resend.emails.send({
    from: 'PlacePool <onboarding@resend.dev>',
    to,
    subject: `${otp} — Your PlacePool OTP`,
    html,
  });

  if (error) throw new Error(`EMAIL SEND FAILED: ${error.message}`);
};