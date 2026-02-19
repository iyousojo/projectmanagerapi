const User = require("../auth/user.model");

class UsersRepository {
  async findById(id) {
    return await User.findById(id).select("-password");
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async save(userInstance) {
    return await userInstance.save();
  }

  // ✅ ADDED: Admin-specific student fetch
  // This resolves the crash happening in the Service layer
  async getStudentsByAdmin(supervisorId, status) {
    const query = { 
      role: "student", 
      assignedSupervisor: supervisorId 
    };
    
    // If a specific status (assigned/unassigned) is passed
    if (status === "assigned") {
      query.assignedSupervisor = { $exists: true, $ne: null };
    }
    
    return await User.find(query).select("-password");
  }

  // ✅ SUPERADMIN: List Admins + their students
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
      { $project: { password: 0, "supervisedStudents.password": 0 } }
    ]);
  }

  // ✅ SUPERADMIN: Filter students by assignment
  async getStudentsByStatus(status) {
    const query = { role: "student" };
    if (status === "assigned") {
      query.assignedSupervisor = { $exists: true, $ne: null };
    } else if (status === "unassigned") {
      query.$or = [{ assignedSupervisor: { $exists: false } }, { assignedSupervisor: null }];
    }
    return await User.find(query)
      .select("-password")
      .populate("assignedSupervisor", "fullName email");
  }

  async updateProfile(id, data) {
    return await User.findByIdAndUpdate(id, { $set: data }, { new: true }).select("-password");
  }

  async authorizeStudent(id, supervisorId) {
    return await User.findByIdAndUpdate(
      id,
      { isAuthorized: true, assignedSupervisor: supervisorId },
      { new: true }
    ).select("-password");
  }

  async updateRole(id, role) {
    return await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
  }
}

module.exports = new UsersRepository();