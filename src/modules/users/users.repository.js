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
    try {
      // 1. Validate BOTH IDs to ensure we don't poison the DB with bad strings
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(supervisorId)) {
        throw new Error("Invalid student ID or supervisor ID format provided to authorizeStudent");
      }

      // 2. Always convert to ObjectId before saving to ensure it stays an "Object" in DB
      const adminObjectId = new mongoose.Types.ObjectId(supervisorId);
      
      // 3. Update the student
      const updatedStudent = await User.findByIdAndUpdate(
        id,
        { 
          isAuthorized: true, 
          assignedSupervisor: adminObjectId // Saves securely as an Object
        },
        { new: true }
      ).select("-password");

      console.log(`✅ Authorized Student ${id} under Admin ${supervisorId}`);
      return updatedStudent;

    } catch (error) {
      console.error("❌ Authorize Error:", error.message);
      throw error; 
    }
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