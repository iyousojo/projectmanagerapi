const Task = require("./task.model");

class TaskRepository {
  async create(taskData) {
    return await Task.create(taskData);
  }

  async findByUser(userId) {
    console.log(`[DB] Querying assignedTo: ${userId}`);
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

  async findById(id) {
    return await Task.findById(id).populate("project assignedTo");
  }

  async update(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, { new: true });
  }
}

module.exports = new TaskRepository();