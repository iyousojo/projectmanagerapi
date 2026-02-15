const TaskRepository = require("./task.repository");
const Project = require("../project/project.model");

class TaskService {
  async createTask(data, adminId) {
    return await TaskRepository.create({ 
      ...data, 
      createdBy: adminId 
    });
  }

  async getTasksByProject(projectId) {
    return await TaskRepository.findByProject(projectId);
  }

  async submitTask(taskId, studentId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");

    // We must fetch the project to check if it's a Group or Individual type
    const project = await Project.findById(task.project);
    if (!project) throw new Error("Project associated with this task not found");

    // ✅ RESTORED LOGIC: Check Project Head for Groups
    if (project.projectType === "Group") {
      if (!project.projectHead || project.projectHead.toString() !== studentId.toString()) {
        throw new Error("Only the Project Head can submit tasks for group projects.");
      }
    } else {
      // ✅ RESTORED LOGIC: Check assigned student for Individual projects
      if (!task.assignedTo || task.assignedTo._id.toString() !== studentId.toString()) {
        throw new Error("You are not assigned to this task.");
      }
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