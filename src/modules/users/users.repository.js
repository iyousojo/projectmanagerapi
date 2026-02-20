const User = require("../auth/user.model");
const mongoose = require("mongoose");

class UsersRepository {
  async findById(id) {
    return await User.findById(id).select("-password");
  }

  async getStudentsByAdmin(supervisorId) {
    try {
      // Ensure we have a valid ObjectId
      const adminId = new mongoose.Types.ObjectId(supervisorId);
      
      const students = await User.find({ 
        role: "student", 
        assignedSupervisor: adminId 
      })
      .select("-password")
      .sort({ fullName: 1 });

      // LOGGING FOR LOCALHOST TESTING
      console.log("-----------------------------------------");
      console.log(`Admin ID: ${supervisorId}`);
      console.log(`Querying for assignedSupervisor: ${adminId}`);
      console.log(`Results Found: ${students.length}`);
      console.log("-----------------------------------------");

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