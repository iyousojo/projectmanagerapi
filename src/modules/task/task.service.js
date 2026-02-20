const TaskRepository = require("./task.repository");
// ❌ DELETE this line from here: const Project = require("../project/project.model");

class TaskService {
  async getTasksByUser(userId) {
    return await TaskRepository.findByUser(userId);
  }

  async createTask(data, adminId) {
    // ✅ MOVE THE IMPORT HERE to break the circular dependency loop
    const Project = require("../project/project.model"); 

    // 1. Find the project this student belongs to
    const studentProject = await Project.findOne({
      $or: [
        { projectHead: data.assignedTo },
        { members: data.assignedTo }
      ]
    });

    if (!studentProject) {
      throw new Error("Validation Failed: Student must belong to a project before receiving tasks.");
    }

    // 2. Map data correctly to satisfy your Schema
    // Your frontend uses 'deadline', but your schema might use 'dueDate'
    return await TaskRepository.create({ 
      title: data.title,
      description: data.description,
      dueDate: data.deadline || data.dueDate, 
      assignedTo: data.assignedTo,
      project: studentProject._id, 
      createdBy: adminId,
      status: "Pending"
    });
  }

  async getTasksByProject(projectId) {
    return await TaskRepository.findByProject(projectId);
  }

  async submitTask(taskId, studentId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");
    
    // ✅ Keep the internal import here too if needed
    const Project = require("../project/project.model");

    if (task.project) {
      const project = await Project.findById(task.project);
      if (project && project.projectType === "Group") {
        if (!project.projectHead || project.projectHead.toString() !== studentId.toString()) {
          throw new Error("Only the Project Head can submit tasks for group projects.");
        }
      }
    }

    const assignedId = task.assignedTo?._id || task.assignedTo;
    if (assignedId?.toString() !== studentId.toString()) {
      throw new Error("You are not assigned to this task.");
    }

    return await TaskRepository.update(taskId, { status: "Submitted" });
  }

  async approveTask(taskId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");
    return await TaskRepository.update(taskId, { status: "Approved" });
  }
}

module.exports = new TaskService();