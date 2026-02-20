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

  // ✅ ADMIN: Fetch students assigned to them
  async getStudentsByAdmin(supervisorId, status) {
    const query = { 
      role: "student", 
      assignedSupervisor: supervisorId 
    };
    if (status) query.status = status;
    return await User.find(query).select("-password");
  }

  // ✅ SUPERADMIN: List Admins + count of their students
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
      {
        $addFields: {
          // Adds studentCount field for your mobile UI badges
          studentCount: { $size: "$supervisedStudents" }
        }
      },
      { $project: { password: 0, "supervisedStudents.password": 0 } }
    ]);
  }

  // ✅ SUPERADMIN: Generic Filter
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

  // ✅ FIX: Specific method the Service is calling to avoid "not a function" error
  async getUnassignedStudents() {
    return await this.getStudentsByStatus("unassigned");
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