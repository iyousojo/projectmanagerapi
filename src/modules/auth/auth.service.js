const AuthRepository = require("./auth.repository");
const User = require("./user.model"); 
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

class AuthService {
  /**
   * Registers a new user. 
   * Email verification is currently DISABLED to avoid cloud host blocks.
   */
  async register(data) {
    const existingUser = await AuthRepository.findByEmail(data.email);

    if (existingUser) {
      // Since we aren't using verification stubs anymore, 
      // any existing email is a hard conflict.
      throw new Error("Email already in use. Please login instead.");
    }

    const userData = {
      ...data,
      role: data.role || "student",
      // AUTO-VERIFY: Setting this to true so they can login immediately
      emailVerified: true, 
      // Admins still need manual approval, students are good to go
      isAuthorized: !(data.role === "admin" || data.role === "super-admin")
    };

    const user = await AuthRepository.createUser(userData);
    
    // We skip generating tokens and sending emails for now
    console.log(`User ${user.email} registered and auto-verified. ✅`);
    
    return user;
  }

  async login(email, password) {
    const user = await AuthRepository.findByEmail(email);
    
    if (!user || !(await user.matchPassword(password))) {
      throw new Error("Invalid credentials.");
    }
    
    // Check for admin authorization, but email is already 'true'
    if (!user.isAuthorized) {
      throw new Error("Your account is pending admin approval.");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    return { user, token };
  }

  /**
   * Placeholder - Always returns true while verification is disabled
   */
  async verifyEmail(email, token) {
    console.log("Verification requested, but auto-verify is active.");
    return true;
  }

  /**
   * Placeholder - Disabled to prevent ETIMEDOUT errors on Render
   */
  async forgotPassword(email) {
    throw new Error("Password reset via email is currently disabled for maintenance.");
  }

  async resetPassword(token, newPassword) {
    throw new Error("Password reset is currently disabled.");
  }
}

module.exports = new AuthService();