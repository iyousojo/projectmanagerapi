const TaskRepository = require("./task.repository");
// ❌ DELETE this line from here: const Project = require("../project/project.model");

class TaskService {
  async getTasksByUser(userId) {
    return await TaskRepository.findByUser(userId);
  }

  async createTask(data, adminId) {
    // ✅ LAZY LOAD: Import inside the function to avoid "not defined" or circular errors
    const Project = require("../project/project.model");

    let projectId = data.project;

    if (!projectId) {
      const activeProject = await Project.findOne({ 
        $or: [
          { projectHead: data.assignedTo },
          { members: data.assignedTo }
        ]
      });

      if (!activeProject) {
        throw new Error("This student is not linked to any project. Create a project first!");
      }
      projectId = activeProject._id;
    }

    return await TaskRepository.create({ 
      ...data, 
      project: projectId, 
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