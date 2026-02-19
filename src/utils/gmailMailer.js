const nodemailer = require("nodemailer");

// 1. Configure Transporter for Cloud Environments (Render/Vercel)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL Port - Usually allowed by Render
  secure: true, 
  pool: true,   // Maintains connection for better performance
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Your 16-character App Password
  },
  tls: {
    // Prevents issues with self-signed certificates on cloud servers
    rejectUnauthorized: false 
  }
});

// 2. Core Sending Logic
async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Project Manager" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email Sent Successfully! ✅", info.messageId);
    return info;
  } catch (error) {
    console.error("--- GMAIL SERVICE ERROR ---");
    console.error("Error Code:", error.code);
    console.error("Message:", error.message);
    throw error;
  }
}

// 3. Email Service Methods for Auth Flow
const EmailService = {
  // Pulls the Netlify URL from your .env
  bridgeUrl: process.env.APP_BASE_URL || "https://soft-bienenstitch-792856.netlify.app",

  /**
   * Sends Verification Link via Netlify Bridge
   * This triggers an automatic verification on the Netlify side
   */
  sendVerificationEmail: async function(to, token) {
    // We include the email so the Netlify bridge can call the verify API automatically
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
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #bbb;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>`;
    return sendMail({ to, subject: "Verify Your Account", html });
  },

  /**
   * Sends Password Reset Link via Netlify Bridge
   * This redirects the user to the app to set a new password
   */
  sendResetPasswordEmail: async function(to, token) {
    const url = `${this.bridgeUrl}/?status=reset&token=${token}&email=${to}`;
    const html = `
      <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #fff;">
        <div style="max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h2 style="color: #d9534f;">Reset Your Password</h2>
            <p style="color: #555;">A password reset was requested for your account. Click below to proceed securely in the app.</p>
            <a href="${url}" style="display: inline-block; background: #d9534f; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">RESET PASSWORD</a>
            <p style="font-size: 11px; color: #999;">This link expires in 30 minutes. If you did not request this, please secure your account.</p>
        </div>
      </div>`;
    return sendMail({ to, subject: "Password Reset Request", html });
  },
};

module.exports = EmailService;