const TaskRepository = require("./task.repository");
const Project = require("../project/project.model");

class TaskService {
  // ✅ ADDED: Get tasks by User ID (Fixes the 404/Service crash)
async getTasksByUser(userId) {
    return await TaskRepository.findByUser(userId);
  }

  async createTask(data, adminId) {
    // 1. Find the project this student belongs to
    // We search the 'Project' collection for any project where this student is the head or a member
    const studentProject = await Project.findOne({
      $or: [
        { projectHead: data.assignedTo },
        { members: data.assignedTo }
      ]
    });

    // If no project is found, we can't create a task because 'project' is required in the Task Model
    if (!studentProject) {
      throw new Error("Validation Failed: Student must belong to a project before receiving tasks.");
    }

    // 2. Create the task with the found Project ID
    return await TaskRepository.create({ 
      ...data, 
      project: studentProject._id, // ✅ This satisfies the 'required' field in your Schema
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

    // If the task is linked to a project, enforce group rules
    if (task.project) {
      const project = await Project.findById(task.project);
      if (project && project.projectType === "Group") {
        if (!project.projectHead || project.projectHead.toString() !== studentId.toString()) {
          throw new Error("Only the Project Head can submit tasks for group projects.");
        }
      }
    }

    // Default check: Ensure the student submitting is the one assigned
    // We check task.assignedTo (handling both populated and unpopulated ID)
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