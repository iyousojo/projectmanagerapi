const Task = require("./task.model");
const mongoose = require("mongoose");

class TaskRepository {
  async create(taskData) {
    return await Task.create(taskData);
  }

  async findByUser(userId) {
    return await Task.find({ assignedTo: userId })
      .populate("project")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });
  }

  async findByProject(projectId) {
    return await Task.find({ project: projectId })
      .populate("assignedTo", "fullName email")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });
  }

  /**
   * Deep populate is used here so the Controller can access:
   * task.project.supervisor (for notifications)
   */
  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Task.findById(id)
      .populate({
        path: "project",
        select: "title supervisor projectHead"
      })
      .populate("assignedTo", "fullName email expoPushToken");
  }

  async update(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async deleteTask(id) {
    return await Task.findByIdAndDelete(id);
  }
}

module.exports = new TaskRepository();