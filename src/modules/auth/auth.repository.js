const User = require("./user.model");
const mongoose = require("mongoose");

class AuthRepository {
  async createUser(data) { return await User.create(data); }
  async findByEmail(email) { return await User.findOne({ email }); }
  async findById(id) { return await User.findById(id); }
  async update(user) { return await user.save(); }
  
  async findStudentsBySupervisor(adminId) {
    try {
      const supervisorId = new mongoose.Types.ObjectId(adminId);
      const students = await User.find({
        role: "student",
        assignedSupervisor: supervisorId
      });
      return students;
    } catch (err) {
      console.error("❌ Repository Error:", err.message);
      return [];
    }
  }
}

module.exports = new AuthRepository();