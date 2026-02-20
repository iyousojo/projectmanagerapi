const Task = require("./task.model");

class TaskRepository {
  async create(taskData) {
    return await Task.create(taskData);
  }

  // ✅ ADDED: Fetch tasks assigned to a specific student
  // This matches the findByUser(userId) call in your TaskService
  async findByUser(userId) {
    return await Task.find({ assignedTo: userId })
      .populate("project") // Useful if you need project details in the task card
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
    // Populate project to ensure the service can read projectType and projectHead
    return await Task.findById(id).populate("project assignedTo");
  }

  async update(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, { new: true });
  }
}

module.exports = new TaskRepository();