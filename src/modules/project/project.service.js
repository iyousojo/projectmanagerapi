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

    // Security Logic: Ensure the user is either the supervisor or a member
    const isMember = project.members.some(m => m._id.toString() === userId.toString());
    const isSupervisor = project.supervisor._id.toString() === userId.toString();

    if (role !== "super-admin" && !isMember && !isSupervisor) {
      throw new Error("Unauthorized access to this project");
    }

    return project;
  }

  /**
   * ✅ Update Project Service
   * Logic: Only the supervisor or a super-admin can change project state
   */
  async updateProject(projectId, updateData, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    // Authorization Check
    const isSupervisor = project.supervisor._id.toString() === userId.toString();
    const isSuperAdmin = false; // Add your logic if you have a specific super-admin check

    if (!isSupervisor && !isSuperAdmin) {
      throw new Error("Only the assigned supervisor can modify this project state.");
    }

    return await ProjectRepository.update(projectId, updateData);
  }

  /**
   * ✅ Delete Project Service
   * Logic: Prevent accidental deletions by ensuring supervisor authorization
   */
  async deleteProject(projectId, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    const isSupervisor = project.supervisor._id.toString() === userId.toString();

    if (!isSupervisor) {
      throw new Error("Unauthorized: Only the supervisor can delete this project.");
    }

    return await ProjectRepository.delete(projectId);
  }
}

module.exports = new ProjectService();