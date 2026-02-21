const Project = require("./project.model");
const mongoose = require("mongoose");

class ProjectRepository {
  async create(data) {
    return await Project.create(data);
  }

  async findBySupervisor(supervisorId) {
    const adminId = new mongoose.Types.ObjectId(supervisorId);
    return await Project.find({ supervisor: adminId })
      .populate("members", "fullName email")
      .populate("projectHead", "fullName email")
      .sort({ createdAt: -1 });
  }

  async findByMember(userId) {
    const memberId = new mongoose.Types.ObjectId(userId);
    return await Project.find({ members: memberId })
      .populate("supervisor", "fullName email")
      .populate("projectHead", "fullName email")
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    return await Project.findById(id)
      .populate("members", "fullName email profilePic")
      .populate("projectHead", "fullName email")
      .populate("supervisor", "fullName email");
  }

  async update(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Project ID");

    return await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, // ✅ FIXED: Standard Mongoose syntax over 'returnDocument'
        runValidators: true 
      }
    )
    .populate("members", "fullName email")
    .populate("projectHead", "fullName email")
    .populate("supervisor", "fullName email");
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Project ID");
    return await Project.findByIdAndDelete(id);
  }

  async updateStatus(id, newStatus) {
    return await this.update(id, { status: newStatus });
  }
}

module.exports = new ProjectRepository();