const User = require("../auth/user.model");
const mongoose = require("mongoose");

class UsersRepository {
  async findById(id) {
    return await User.findById(id).select("-password");
  }
async getStudentsByAdmin(supervisorId) {
  try {
    // 1. Validate if it's a valid ID string before converting
    if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
      console.log("❌ Invalid Supervisor ID format received");
      return [];
    }

    // 2. Convert string to the Object type MongoDB expects
    const adminObjectId = new mongoose.Types.ObjectId(supervisorId);
    
    // 3. Query using the converted Object
    const students = await User.find({ 
      role: "student", 
      assignedSupervisor: adminObjectId 
    })
    .select("-password")
    .sort({ fullName: 1 });

    console.log(`-----------------------------------------`);
    console.log(`📱 Handshake: Admin ${supervisorId} requested students.`);
    console.log(`📊 Result: Found ${students.length} students in DB.`);
    console.log(`-----------------------------------------`);

    return students;
  } catch (error) {
    console.error("Repository Error:", error.message);
    return [];
  }
}
  async getUnassignedStudents() {
    return await User.find({
      role: "student",
      $or: [
        { assignedSupervisor: { $exists: false } },
        { assignedSupervisor: null }
      ]
    }).select("-password");
  }

  async authorizeStudent(id, supervisorId) {
  // Always convert to ObjectId before saving to ensure it stays an "Object" in DB
  const adminId = new mongoose.Types.ObjectId(supervisorId);
  
  return await User.findByIdAndUpdate(
    id,
    { 
      isAuthorized: true, 
      assignedSupervisor: adminId // This saves it as an Object, not a String
    },
    { new: true }
  ).select("-password");
}

  async getAdminsWithTheirStudents() {
    return await User.aggregate([
      { $match: { role: "admin" } },
      {
        $lookup: {
          from: "users", 
          localField: "_id",
          foreignField: "assignedSupervisor",
          as: "supervisedStudents"
        }
      },
      { $addFields: { studentCount: { $size: "$supervisedStudents" } } },
      { $project: { password: 0, "supervisedStudents.password": 0 } }
    ]);
  }

  async getStudentsByStatus(status) {
    const query = { role: "student" };
    if (status === "assigned") {
      query.assignedSupervisor = { $exists: true, $ne: null };
    }
    return await User.find(query)
      .select("-password")
      .populate("assignedSupervisor", "fullName email");
  }
}

module.exports = new UsersRepository();