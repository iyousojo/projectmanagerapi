const AuthRepository = require("./auth.repository");
const User = require("./user.model"); // Required for resetPassword query
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailService = require("../../utils/gmailMailer");

class AuthService {
  /**
   * Registers a new user. 
   * If email exists but is unverified, it deletes the old record to allow a fresh start.
   */
  async register(data) {
    const existingUser = await AuthRepository.findByEmail(data.email);

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new Error("Email already in use and verified. Please login instead.");
      } else {
        // Remove unverified "ghost" account to allow user to try registration again
        console.log(`Clearing unverified account: ${data.email}`);
        await AuthRepository.deleteUser(existingUser._id);
      }
    }

    const userData = {
      ...data,
      role: data.role || "student",
      // Admins/Super-admins are unauthorized until a higher-up approves them
      isAuthorized: !(data.role === "admin" || data.role === "super-admin")
    };

    const user = await AuthRepository.createUser(userData);
    const otp = user.generateEmailToken(); 
    
    await AuthRepository.update(user); 

    // Sends the email with the direct verification bridge link
    await EmailService.sendVerificationEmail(user.email, otp);
    
    return user;
  }

  async login(email, password) {
    const user = await AuthRepository.findByEmail(email);
    
    if (!user || !(await user.matchPassword(password))) {
      throw new Error("Invalid credentials.");
    }
    
    if (!user.emailVerified) {
      throw new Error("Please verify your email first.");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    return { user, token };
  }

  /**
   * Verifies the email token sent from the Netlify Bridge
   */
  async verifyEmail(email, token) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error("User not found.");
    
    // Allow bridge to redirect even if already clicked once
    if (user.emailVerified) return true; 
    
    if (user.emailVerificationToken !== token) {
      throw new Error("Invalid or expired verification code.");
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await AuthRepository.update(user);
    
    return true;
  }

  /**
   * Generates a password reset token and sends email
   */
  async forgotPassword(email) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error("No user found with that email.");

    const resetToken = user.generateResetToken();
    await AuthRepository.update(user);

    await EmailService.sendResetPasswordEmail(user.email, resetToken);
    return true;
  }

  /**
   * Finalizes the password reset using the hashed token comparison
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error("Token is invalid or has expired.");

    user.password = newPassword; // Hashing handled by User model pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await AuthRepository.update(user);
    return true;
  }
}

module.exports = new AuthService();