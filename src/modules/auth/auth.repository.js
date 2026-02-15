const User = require("./user.model");
const crypto = require("crypto");

class AuthRepository {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByEmailToken(token) {
    return await User.findOne({ emailVerificationToken: token });
  }

  // ✅ UPDATED: Hash the incoming token to match the database record
  async findByResetToken(token) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    return await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() } // Ensure it hasn't expired
    });
  }

  async update(user) {
    return await user.save();
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new AuthRepository();