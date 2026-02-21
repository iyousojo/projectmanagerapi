const ProjectRepository = require("./project.repository");
const Project = require("./project.model"); // Required for the addTask direct call

class ProjectService {
  async createProject(data) {
    return await ProjectRepository.create(data);
  }

  async getProjectsBySupervisor(supervisorId) {
    return await ProjectRepository.findBySupervisor(supervisorId);
  }

  async getProjectsByMember(userId) {
    return await ProjectRepository.findByMember(userId);
  }

  async getProjectById(projectId, userId, role) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    // ✅ Standardized string comparison
    const isMember = project.members.some(m => m._id.toString() === userId.toString());
    const isSupervisor = project.supervisor._id.toString() === userId.toString();
    const isSuperAdmin = role === "super-admin";

    if (!isSuperAdmin && !isMember && !isSupervisor) {
      throw new Error("Unauthorized access to this project");
    }

    return project;
  }

  /**
   * ✅ Update Project Service
   * STRICT LOGIC: Only the specifically assigned Admin (Supervisor) can modify.
   */
  async updateProject(projectId, updateData, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    // Ensure we compare strings to avoid Mongoose ObjectId mismatch
    const supervisorId = project.supervisor._id.toString();
    const currentUserId = userId.toString();

    const isSupervisor = supervisorId === currentUserId;

    if (!isSupervisor) {
      console.log(`Mismatch: Project Supervisor ${supervisorId} vs Current User ${currentUserId}`);
      throw new Error("Access Denied: Only the assigned Supervisor can modify this project state.");
    }

    return await ProjectRepository.update(projectId, updateData);
  }

  /**
   * ✅ Delete Project Service
   * STRICT LOGIC: Only the assigned Supervisor can delete.
   */
  async deleteProject(projectId, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    const isSupervisor = project.supervisor._id.toString() === userId.toString();

    if (!isSupervisor) {
      throw new Error("Unauthorized: Only the assigned Supervisor can delete this project.");
    }

    return await ProjectRepository.delete(projectId);
  }

  /**
   * ✅ Add Task / Progress Log
   * Allows adding items to the tasks array
   */
  async addTask(projectId, taskData) {
    // Ensuring the project exists first
    const projectExists = await ProjectRepository.findById(projectId);
    if (!projectExists) throw new Error("Project not found");

    return await Project.findByIdAndUpdate(
      projectId,
      {
        $push: {
          tasks: {
            title: taskData.title,
            description: taskData.description,
            postedBy: taskData.postedBy, // Added to track who made the log
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("members", "fullName email")
     .populate("supervisor", "fullName email");
  }
}

module.exports = new ProjectService();