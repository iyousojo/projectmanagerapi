const User = require("../auth/user.model");
const Project = require("../project/project.model");

class UsersService {
  async getProfile(id) {
    return await User.findById(id).populate("assignedSupervisor", "fullName email");
  }

  async getAllAdmins() {
    // ✅ Logic: Only find verified Admins
    return await User.find({ 
      role: "admin", 
      emailVerified: true 
    }).select("-password").sort({ fullName: 1 });
  }

  async getFilteredStudents(status, supervisorId) {
    // ✅ Logic: Invisible if emailVerified is false
    let query = { 
      role: "student", 
      emailVerified: true 
    };

    if (supervisorId) {
      // Admin view: only students assigned to them
      query.assignedSupervisor = supervisorId;
    } else if (status === "unassigned") {
      // Super-admin view: only verified students with no supervisor
      query.isAuthorized = false;
    } else if (status === "assigned") {
      // Super-admin view: verified students already paired
      query.isAuthorized = true;
    }

    return await User.find(query)
      .select("-password")
      .populate("assignedSupervisor", "fullName");
  }

  async authorizeStudent(studentId, supervisorId) {
    // 1. Find the student
    const student = await User.findById(studentId);
    if (!student) throw new Error("Student not found");

    // ✅ Logic: Prevent assignment if email is not verified
    if (!student.emailVerified) {
      throw new Error("Cannot authorize a student who has not verified their email.");
    }

    // 2. Verify the supervisor exists, is verified, and is an admin
    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== "admin" || !supervisor.emailVerified) {
      throw new Error("Invalid supervisor. Selected user must be a verified Admin.");
    }

    // 3. Apply the pairing logic
    student.isAuthorized = true;
    student.assignedSupervisor = supervisorId;
    
    return await student.save();
  }

  async getSuperAdminStats() {
    // ✅ Logic: Stats only count verified users
    const totalAdmins = await User.countDocuments({ role: "admin", emailVerified: true });
    const totalStudents = await User.countDocuments({ role: "student", emailVerified: true });
    const totalProjects = await Project.countDocuments();
    
    // Track those stuck in the "Verification" stage
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });

    return {
      totalAdmins,
      totalStudents,
      totalProjects,
      unverifiedUsers,
      pendingAuthorization: await User.countDocuments({ 
        role: "student", 
        isAuthorized: false, 
        emailVerified: true 
      })
    };
  }
}

module.exports = new UsersService();