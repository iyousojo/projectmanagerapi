const AuthRepository = require("./auth.repository");
const jwt = require("jsonwebtoken");

class AuthService {
  async register(data) {
    const existingUser = await AuthRepository.findByEmail(data.email);
    if (existingUser) throw new Error("Email already in use.");

    const userData = {
      ...data,
      role: data.role || "student",
      emailVerified: true, 
      isAuthorized: !(data.role === "admin" || data.role === "super-admin")
    };

    return await AuthRepository.createUser(userData);
  }

  // ✅ Receives token from Controller
  async login(email, password, expoPushToken = null) {
    const user = await AuthRepository.findByEmail(email);
    
    if (!user || !(await user.matchPassword(password))) {
      throw new Error("Invalid credentials.");
    }
    
    if (!user.isAuthorized) {
      throw new Error("Your account is pending admin approval.");
    }

    // ✅ Save/Update the push token in the DB
    if (expoPushToken) {
      user.expoPushToken = expoPushToken;
      await user.save();
      console.log(`Push token updated for ${email}`);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    return { user, token };
  }

  async getUserProfile(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) throw new Error("User not found.");
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }

  async verifyEmail(email, token) { return true; }
  async forgotPassword(email) { throw new Error("Disabled for maintenance."); }
  async resetPassword(token, newPassword) { throw new Error("Disabled."); }
}

module.exports = new AuthService();