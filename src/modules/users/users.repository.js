const User = require("../auth/user.model");
const mongoose = require("mongoose");

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

  // ✅ ADMIN FIX: Remove the non-existent 'status' field query
  async getStudentsByAdmin(supervisorId) {
    try {
      // Ensure we are querying by the correct field: 'assignedSupervisor'
      const query = { 
        role: "student", 
        assignedSupervisor: supervisorId 
      };

      // console.log("Admin Querying for:", query); // Use this to debug the ID
      
      return await User.find(query)
        .select("-password")
        .sort({ fullName: 1 }); // Sorted alphabetically
    } catch (error) {
      throw new Error("Repository Error: " + error.message);
    }
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

  async getUnassignedStudents() {
    return await this.getStudentsByStatus("unassigned");
  }

  async updateProfile(id, data) {
    return await User.findByIdAndUpdate(id, { $set: data }, { new: true }).select("-password");
  }

  // ✅ Ensure this field matches your SCHEMA: assignedSupervisor
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