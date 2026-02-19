// users.service.js
const User = require("../auth/user.model");

class UsersService {
  async getFilteredStudents(status, supervisorId) {
    let query = { role: "student" };

    if (supervisorId) {
      // FORCE: Admin can only see students assigned to them
      query.assignedSupervisor = supervisorId;
    } else {
      // OPTIONAL: Super-Admin can filter by status
      if (status === "unassigned") {
        query.assignedSupervisor = { $exists: false };
      } else if (status === "assigned") {
        query.assignedSupervisor = { $exists: true, $ne: null };
      }
    }

    return await User.find(query)
      .select("-password")
      .populate("assignedSupervisor", "fullName email")
      .sort({ createdAt: -1 });
  }

  async getAllAdmins() {
    return await User.find({ role: "admin" }).select("-password");
  }

  async authorizeStudent(studentId, supervisorId) {
    return await User.findByIdAndUpdate(
      studentId,
      { isAuthorized: true, assignedSupervisor: supervisorId },
      { new: true }
    );
  }
}

module.exports = new UsersService();