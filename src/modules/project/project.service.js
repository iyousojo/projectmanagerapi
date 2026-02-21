const ProjectRepository = require("./project.repository");
const Project = require("./project.model"); 

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
    
    const isSupervisor = project.supervisor && 
        (project.supervisor._id ? project.supervisor._id.toString() : project.supervisor.toString()) === userId.toString();
    
    const isSuperAdmin = role === "super-admin";

    if (!isSuperAdmin && !isMember && !isSupervisor) {
      throw new Error("Unauthorized access to this project");
    }

    return project;
  }

  async updateProject(projectId, updateData, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    if (!project.supervisor) throw new Error("Action Denied: This project has no assigned supervisor.");

    const supervisorId = project.supervisor._id 
        ? project.supervisor._id.toString() 
        : project.supervisor.toString();
        
    const currentUserId = userId.toString();

    // Allow Admin/Supervisor to update. 
    // Note: If you have SuperAdmins, you might want to add (role !== 'super-admin') check here.
    if (supervisorId !== currentUserId) {
      throw new Error("Access Denied: You are not the assigned Supervisor for this project.");
    }

    // ✅ Logic for changing Project Head
    if (updateData.projectHead) {
      const isMember = project.members.some(m => m._id.toString() === updateData.projectHead.toString());
      if (!isMember) throw new Error("The selected user must be a member of this project.");
    }

    return await ProjectRepository.update(projectId, updateData);
  }

  async deleteProject(projectId, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");
    if (!project.supervisor) throw new Error("Action Denied: This project has no assigned supervisor.");

    const supervisorId = project.supervisor._id ? project.supervisor._id.toString() : project.supervisor.toString();
    if (supervisorId !== userId.toString()) {
      throw new Error("Unauthorized: Only the assigned Supervisor can delete this project.");
    }

    return await ProjectRepository.delete(projectId);
  }

  async addTask(projectId, taskData) {
    const projectExists = await ProjectRepository.findById(projectId);
    if (!projectExists) throw new Error("Project not found");

    return await Project.findByIdAndUpdate(
      projectId,
      {
        $push: {
          tasks: {
            title: taskData.title,
            description: taskData.description,
            postedBy: taskData.postedBy,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate("members", "fullName email profilePic")
     .populate("supervisor", "fullName email");
  }
}

module.exports = new ProjectService();