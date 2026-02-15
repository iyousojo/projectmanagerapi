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
    const isMember = project.members.some(id => id.toString() === userId.toString());
    const isSupervisor = project.supervisor.toString() === userId.toString();

    if (role !== "super-admin" && !isMember && !isSupervisor) {
      throw new Error("Unauthorized access to this project");
    }

    return project;
  }
}

module.exports = new ProjectService();