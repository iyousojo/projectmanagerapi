const User = require("../auth/user.model");
const mongoose = require("mongoose"); // Added mongoose for ID casting

class UsersRepository {
  async findById(id) {
    return await User.findById(id).select("-password");
  }

  // ✅ FIXED: Using ObjectId casting to ensure IDs match in the DB
  async getStudentsByAdmin(supervisorId) {
    try {
      const adminId = new mongoose.Types.ObjectId(supervisorId);
      
      return await User.find({ 
        role: "student", 
        assignedSupervisor: adminId 
      })
      .select("-password")
      .sort({ fullName: 1 });
    } catch (error) {
      console.error("Repository Error in getStudentsByAdmin:", error.message);
      return []; // Return empty array instead of throwing to prevent frontend crash
    }
  }

  // ✅ SUPERADMIN: List unassigned students
  async getUnassignedStudents() {
    return await User.find({
      role: "student",
      $or: [
        { assignedSupervisor: { $exists: false } },
        { assignedSupervisor: null }
      ]
    }).select("-password");
  }

  // ✅ Pairing logic with ID casting
  async authorizeStudent(id, supervisorId) {
    const adminId = new mongoose.Types.ObjectId(supervisorId);
    return await User.findByIdAndUpdate(
      id,
      { isAuthorized: true, assignedSupervisor: adminId },
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