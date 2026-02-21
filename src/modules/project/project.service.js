const ProjectRepository = require("./project.repository");

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

    const isMember = project.members.some(m => m._id.toString() === userId.toString());
    const isSupervisor = project.supervisor._id.toString() === userId.toString();
    const isSuperAdmin = role === "super-admin";

    // Super-Admin can view, but only Members/Supervisors have standard access
    if (!isSuperAdmin && !isMember && !isSupervisor) {
      throw new Error("Unauthorized access to this project");
    }

    return project;
  }

  /**
   * ✅ Update Project Service
   * STRICT LOGIC: Only the specifically assigned Admin (Supervisor) can modify.
   */
// ✅ project.service.js

async updateProject(projectId, updateData, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    // FIX: Ensure both are strings for comparison
    const supervisorId = project.supervisor._id.toString();
    const currentUserId = userId.toString();

    const isSupervisor = supervisorId === currentUserId;

    if (!isSupervisor) {
        // Logging for debugging - check your terminal to see if IDs actually match
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
  


async addTask(projectId, taskData) {
  // We use findByIdAndUpdate with $push to add to the tasks array
  return await Project.findByIdAndUpdate(
    projectId,
    { 
      $push: { 
        tasks: { 
          title: taskData.title, 
          description: taskData.description,
          createdAt: new Date() 
        } 
      } 
    },
    { new: true }
  );
}
}
module.exports = new ProjectService();