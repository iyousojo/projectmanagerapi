const User = require("../auth/user.model");

class UsersRepository {
  async findById(id) {
    return await User.findById(id).select("-password");
  }

  // ✅ FIXED: Correctly filters by the supervisor's ID
  async getStudentsByAdmin(supervisorId) {
    try {
      return await User.find({ 
        role: "student", 
        assignedSupervisor: supervisorId 
      })
      .select("-password")
      .sort({ fullName: 1 });
    } catch (error) {
      throw new Error("Repository Error: " + error.message);
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

  // ✅ Pairing logic
  async authorizeStudent(id, supervisorId) {
    return await User.findByIdAndUpdate(
      id,
      { isAuthorized: true, assignedSupervisor: supervisorId },
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