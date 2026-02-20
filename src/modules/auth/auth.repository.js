const User = require("./user.model");

class AuthRepository {
  async createUser(data) { 
    return await User.create(data); 
  }

  async findByEmail(email) { 
    return await User.findOne({ email }); 
  }

  async findById(id) { 
    // This is crucial for your getProfile sync logic
    return await User.findById(id); 
  }

  async update(user) {
    return await user.save();
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }
async findStudentsBySupervisor(adminId) {
    try {
      // ✅ CRITICAL: Convert the string "6997a8b5..." into a real Mongoose ObjectId
      const supervisorId = new mongoose.Types.ObjectId(adminId);

      const students = await User.find({
        role: "student",
        assignedSupervisor: supervisorId // Now types match exactly
      });

      console.log(`📊 DB Sync: Found ${students.length} students for Supervisor ${adminId}`);
      return students;
    } catch (err) {
      console.error("❌ Repository Error:", err.message);
      return [];
    }
  }
}


module.exports = new AuthRepository();