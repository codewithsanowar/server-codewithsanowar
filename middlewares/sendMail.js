import nodemailer from "nodemailer";

export const sendMail = async (to, subject, data) => {
  // ✅ fail loudly and clearly if env vars are missing, instead of a vague crash
  if (!process.env.Gmail_Email || !process.env.Gmail_Password) {
    throw new Error(
      "Email service is not configured — Gmail_Email or Gmail_Password env var is missing"
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Gmail_Email,
      pass: process.env.Gmail_Password, // must be a 16-char Gmail App Password, not your normal password
    },
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #111827;">Hi ${data.name},</h2>
      <p style="color: #374151; font-size: 15px;">
        Your OTP for verifying your CodeWithSanowar account is:
      </p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111827; margin: 16px 0;">
        ${data.otp}
      </div>
      <p style="color: #6b7280; font-size: 13px;">
        This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"CodeWithSanowar" <${process.env.Gmail_Email}>`,
    to,
    subject,
    html,
  });
};
