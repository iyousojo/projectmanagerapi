// Pulls the Netlify URL from your Render Environment Variables
const bridgeUrl = process.env.APP_BASE_URL; 

async function sendVerificationEmail(to, token) {
  const subject = "Verify Your Account";
  // Points to Netlify with status and token
  const verificationUrl = `${bridgeUrl}/?status=verified&token=${token}`;

  const html = `
    <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #f9f9f9;">
      <div style="max-width: 400px; margin: auto; background: white; padding: 30px; border-radius: 24px; shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h2 style="color: #000; margin-bottom: 10px;">Confirm Your Email</h2>
        <p style="color: #666; font-size: 14px;">Tap the button below to verify your account for Project Manager.</p>
        <a href="${verificationUrl}" style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 25px;">
          Verify My Account
        </a>
      </div>
    </div>
  `;
  return sendMail({ to, subject, html });
}

async function sendResetPasswordEmail(to, token) {
  const subject = "Reset Password";
  const resetUrl = `${bridgeUrl}/?status=reset&token=${token}`;

  const html = `
    <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #f9f9f9;">
      <div style="max-width: 400px; margin: auto; background: white; padding: 30px; border-radius: 24px;">
        <h2 style="color: #000; margin-bottom: 10px;">Security Reset</h2>
        <p style="color: #666; font-size: 14px;">We received a request to reset your password. Tap below to continue in the app.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 25px;">
          Reset Password
        </a>
      </div>
    </div>
  `;
  return sendMail({ to, subject, html });
}