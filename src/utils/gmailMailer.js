// src/utils/gmailMailer.js
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

async function sendMail({ to, subject, text, html }) {
  // REMOVED: The "if (process.env.NODE_ENV !== 'production')" block 
  // so that it actually sends the email through Gmail API even in dev.

  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const messageParts = [
      `From: "ProjectManager" <${process.env.GMAIL_FROM}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      "",
      html || text
    ];
    const message = messageParts.join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    console.log("✅ Gmail API email sent:", res.data.id);
    return res.data;
  } catch (err) {
    console.error("❌ Gmail API error:", err);
    throw new Error("Email could not be sent");
  }
}

async function sendVerificationEmail(to, token) {
  const subject = "Verify Your Email for ProjectManager";

  // Updated fallback to 5000 to match your server port
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:5000"; 
  const verificationUrl = `${baseUrl}/api/auth/verify/${token}`;

  const html = `
    <html>
      <body style="font-family: sans-serif;">
        <h1>Welcome to ProjectManager!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Verify Email</a>
        <p><small>Or copy this link: ${verificationUrl}</small></p>
        <p>If you didn't request this, ignore this email.</p>
      </body>
    </html>
  `;

  return sendMail({ to, subject, html });
}

async function sendResetPasswordEmail(to, token) {
  const subject = "Reset Your Password for ProjectManager";

  const baseUrl = process.env.APP_BASE_URL || "http://localhost:5000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const html = `
    <html>
      <body>
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password (expires in 1 hour):</p>
        <a href="${resetUrl}" style="background:#dc3545;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Reset Password</a>
        <p><small>Or copy this link: ${resetUrl}</small></p>
      </body>
    </html>
  `;

  return sendMail({ to, subject, html });
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendMail
};