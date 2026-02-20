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
      // ✅ FIX: Ensure we try to find the ID as both a String and an ObjectId
      // Some databases store it as a raw string, others as a BSON ObjectId
      const query = {
        role: "student",
        $or: [
          { assignedSupervisor: adminId },
          { assignedSupervisor: new mongoose.Types.ObjectId(adminId) }
        ]
      };

      console.log("🔍 Running DB Query:", JSON.stringify(query));
      return await User.find(query);
    } catch (err) {
      console.error("DB Query Error:", err);
      return [];
    }
  }
}


module.exports = new AuthRepository();