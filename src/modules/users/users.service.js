const User = require("../auth/user.model");

class UsersService {
  async getProfile(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("User profile not found in database");
    return user;
  }

  async getFilteredStudents(status, supervisorId) {
    let query = { role: "student" };

    // If an Admin is logged in, only show their students
    if (supervisorId) {
      query.assignedSupervisor = supervisorId;
    } 

    // Filter by status (unassigned/assigned) for Super-Admins
    if (status === "unassigned") {
      query.assignedSupervisor = { $exists: false };
    } else if (status === "assigned") {
      query.assignedSupervisor = { $exists: true, $ne: null };
    }

    return await User.find(query)
      .select("-password")
      .populate("assignedSupervisor", "fullName email")
      .sort({ createdAt: -1 });
  }

  async getAllAdmins() {
    return await User.find({ role: "admin" }).select("fullName email isAuthorized");
  }

  async authorizeStudent(studentId, supervisorId) {
    return await User.findByIdAndUpdate(
      studentId,
      { 
        isAuthorized: true, 
        assignedSupervisor: supervisorId 
      },
      { new: true }
    ).select("-password");
  }

  async getSuperAdminStats() {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const unassigned = await User.countDocuments({ role: "student", assignedSupervisor: { $exists: false } });

    return {
      totalStudents,
      totalAdmins,
      unassignedStudents: unassigned
    };
  }
}

module.exports = new UsersService();