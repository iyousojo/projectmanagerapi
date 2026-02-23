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

  async login(email, password, expoPushToken = null) {
    const user = await AuthRepository.findByEmail(email);
    
    if (!user || !(await user.matchPassword(password))) {
      throw new Error("Invalid credentials.");
    }
    
    if (!user.isAuthorized) {
      throw new Error("Your account is pending admin approval.");
    }

    // ✅ Save the token to the DB
    if (expoPushToken) {
      user.expoPushToken = expoPushToken;
      await user.save(); // Triggers the fixed pre-save hook above
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

  async verifyEmail() { return true; }
  async forgotPassword() { throw new Error("Maintenance mode."); }
  async resetPassword() { throw new Error("Maintenance mode."); }
}

module.exports = new AuthService();