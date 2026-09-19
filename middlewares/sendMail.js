import { Resend } from "resend";

export const sendMail = async (to, subject, data) => {
  if (!process.env.Resend_Api_Key) {
    throw new Error("Resend_Api_Key is not set in environment variables");
  }

  const resend = new Resend(process.env.Resend_Api_Key);

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

  const { data: result, error } = await resend.emails.send({
    // ✅ "onboarding@resend.dev" works immediately with zero setup for testing.
    // Once you verify your own domain in Resend's dashboard, switch this to
    // something like "CodeWithSanowar <noreply@yourdomain.com>"
    from: "CodeWithSanowar <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message || "Failed to send email");
  }

  return result;
};
