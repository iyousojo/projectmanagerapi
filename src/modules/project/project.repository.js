const Project = require("./project.model");
const mongoose = require("mongoose");

class ProjectRepository {
  /**
   * CREATE PROJECT
   * Initialize a new project in the database.
   */
  async create(data) {
    return await Project.create(data);
  }

  /**
   * FIND BY SUPERVISOR
   * Fetches projects where the user is the assigned supervisor.
   */
  async findBySupervisor(supervisorId) {
    // Ensuring supervisorId is a valid ObjectId for the handshake
    const adminId = new mongoose.Types.ObjectId(supervisorId);
    return await Project.find({ supervisor: adminId })
      .populate("members", "fullName email")
      .populate("projectHead", "fullName email")
      .sort({ createdAt: -1 });
  }

  /**
   * FIND BY MEMBER
   * Fetches projects where the user is listed as a team member.
   */
  async findByMember(userId) {
    const memberId = new mongoose.Types.ObjectId(userId);
    return await Project.find({ members: memberId })
      .populate("supervisor", "fullName email")
      .populate("projectHead", "fullName email")
      .sort({ createdAt: -1 });
  }

  /**
   * FIND BY ID
   * Comprehensive fetch for the Project Details screen.
   */
  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    return await Project.findById(id)
      .populate("members", "fullName email profilePic")
      .populate("projectHead", "fullName email")
      .populate("supervisor", "fullName email");
  }

  /**
   * ADMIN TOTAL CONTROL: Update State
   * ✅ UPDATED: Uses 'returnDocument: after' to fix Mongoose deprecation warnings.
   * Logic: Returns the document AFTER updates are applied for UI consistency.
   */
  async update(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Project ID");

    return await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        returnDocument: 'after', // Fixes (node:68) [MONGOOSE] Warning
        runValidators: true 
      }
    )
    .populate("members", "fullName email")
    .populate("projectHead", "fullName email")
    .populate("supervisor", "fullName email");
  }

  /**
   * ADMIN TOTAL CONTROL: Delete Project
   * Permanently removes the project from the records.
   */
  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Project ID");
    return await Project.findByIdAndDelete(id);
  }

  /**
   * PHASE MANAGEMENT: Helper to quickly advance project status
   * Logic: Wraps the updated update() method.
   */
  async updateStatus(id, newStatus) {
    return await this.update(id, { status: newStatus });
  }
}

module.exports = new ProjectRepository();