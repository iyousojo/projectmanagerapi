const { Resend } = require('resend');

// 1. Initialize Resend (Bypasses SMTP port blocks)
const resend = new Resend(process.env.RESEND_API_KEY);

// 2. Core Sending Logic via HTTP API
async function sendMail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      // IMPORTANT: While testing, use 'onboarding@resend.dev' 
      // After verifying a domain, change to 'noreply@yourdomain.com'
      from: 'Project Manager <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log("Email Sent via HTTP API! ✅", data.id);
    return data;
  } catch (error) {
    console.error("--- EMAIL SERVICE ERROR ---");
    console.error("Message:", error.message);
    throw error;
  }
}

// 3. Email Service Methods for Auth Flow
const EmailService = {
  bridgeUrl: process.env.APP_BASE_URL || "https://soft-bienenstitch-792856.netlify.app",

  sendVerificationEmail: async function(to, token) {
    const url = `${this.bridgeUrl}/?status=verified&token=${token}&email=${to}`;
    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 15px; border: 1px solid #ddd;">
          <h2 style="color: #333;">Action Required: Verify Email</h2>
          <p style="color: #666; font-size: 16px;">Tap the button below to sync your device and complete registration.</p>
          <div style="margin: 30px 0;">
            <a href="${url}" style="background-color: #000000; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 18px; display: inline-block;">VERIFY & OPEN APP</a>
          </div>
          <p style="color: #999; font-size: 12px;">Security Code: <strong>${token}</strong></p>
        </div>
      </div>`;
    return sendMail({ to, subject: "Verify Your Account", html });
  },

  sendResetPasswordEmail: async function(to, token) {
    const url = `${this.bridgeUrl}/?status=reset&token=${token}&email=${to}`;
    const html = `
      <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #fff;">
        <div style="max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
            <h2 style="color: #d9534f;">Reset Your Password</h2>
            <p>Click below to proceed securely in the app.</p>
            <a href="${url}" style="display: inline-block; background: #d9534f; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">RESET PASSWORD</a>
        </div>
      </div>`;
    return sendMail({ to, subject: "Password Reset Request", html });
  },
};

module.exports = EmailService;