const AuthRepository = require("./auth.repository");
const jwt = require("jsonwebtoken");
const EmailService = require("../../utils/gmailMailer");

class AuthService {
  async register(data) {
    const { email, role } = data;
    const existingUser = await AuthRepository.findByEmail(email);

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new Error("Email already in use and verified.");
      } else {
        // Logic: Allow re-registration by deleting the old unverified account
        await AuthRepository.deleteUser(existingUser._id);
      }
    }

    // ✅ Logic: Auto-authorize Admins and Super-Admins
    const userData = {
      ...data,
      role: role || "student",
      isAuthorized: (role === "admin" || role === "super-admin") ? true : false
    };

    const user = await AuthRepository.createUser(userData);
    const token = user.generateEmailToken(); // Ensure this generates a 6-digit code in User model
    await AuthRepository.update(user);

    await EmailService.sendVerificationEmail(user.email, token);
    return user;
  }

  // ✅ UPDATED: Accepts email and token for precision
  async verifyEmail(email, token) {
    const user = await AuthRepository.findByEmail(email);
    
    if (!user) throw new Error("User not found.");
    if (user.emailVerified) throw new Error("Email already verified.");
    if (user.emailVerificationToken !== token) throw new Error("Invalid or expired code.");

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await AuthRepository.update(user);
    return user;
  }

  async login(email, password) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials.");
    if (!user.emailVerified) throw new Error("Please verify your email first.");

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error("Invalid credentials.");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { user, token };
  }

  async forgotPassword(email) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new Error("User not found.");

    const token = user.generateResetToken();
    await AuthRepository.update(user);

    await EmailService.sendResetPasswordEmail(user.email, token);
    return true;
  }

  async resetPassword(token, newPassword) {
    const user = await AuthRepository.findByResetToken(token);
    if (!user) throw new Error("Invalid or expired reset token.");

    user.password = newPassword; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await AuthRepository.update(user);
    return true;
  }
}

module.exports = new AuthService();