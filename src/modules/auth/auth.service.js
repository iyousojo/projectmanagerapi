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
      throw new Error("Email already in use. Please login instead.");
    }

    const userData = {
      ...data,
      role: data.role || "student",
      emailVerified: true, 
      isAuthorized: !(data.role === "admin" || data.role === "super-admin")
    };

    const user = await AuthRepository.createUser(userData);
    console.log(`User ${user.email} registered and auto-verified. ✅`);
    return user;
  }

  async login(email, password) {
    const user = await AuthRepository.findByEmail(email);
    
    if (!user || !(await user.matchPassword(password))) {
      throw new Error("Invalid credentials.");
    }
    
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
   * ✅ NEW: Fetches fresh user data from DB for frontend sync
   * This ensures the frontend has the latest role and supervisor assignment.
   */
  async getUserProfile(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    // Convert to object and strip password for safety
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
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