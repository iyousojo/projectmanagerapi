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
  async updateProject(projectId, updateData, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    // Check if the person trying to update is the assigned supervisor
    const isSupervisor = project.supervisor._id.toString() === userId.toString();

    if (!isSupervisor) {
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
}

module.exports = new ProjectService();