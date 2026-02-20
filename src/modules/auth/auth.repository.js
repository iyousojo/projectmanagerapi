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
      // ✅ Convert the string ID to a MongoDB ObjectId
      const supervisorObjectId = new mongoose.Types.ObjectId(adminId);

      const query = {
        role: "student",
        assignedSupervisor: supervisorObjectId // Match against the real ID type
      };

      console.log("🔍 Running DB Query with ObjectId:", supervisorObjectId);
      
      const students = await User.find(query);
      console.log(`📊 Query Result: Found ${students.length} students.`);
      
      return students;
    } catch (err) {
      console.error("DB Query Error (Likely invalid ID format):", err.message);
      return [];
    }
  }
}


module.exports = new AuthRepository();