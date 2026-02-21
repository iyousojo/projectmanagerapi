const ProjectRepository = require("./project.repository");
const Project = require("./project.model");
const TaskService = require("../task/task.service"); 

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

/**
   * Redirects the task creation logic to the TaskService
   * while ensuring the project exists.
   */
  async addTask(projectId, taskData, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new Error("Project not found");

    // Check if the user is a member or the supervisor
    const isMember = project.members.some(m => m._id.toString() === userId.toString());
    const isSupervisor = project.supervisor && project.supervisor._id.toString() === userId.toString();

    if (!isMember && !isSupervisor) {
      throw new Error("Unauthorized: You must be a member or supervisor of this project to add tasks.");
    }

    // Prepare the data for TaskService
    const taskPayload = {
      ...taskData,
      project: projectId,
      // Default to the user adding it if assignedTo isn't specified
      assignedTo: taskData.assignedTo || userId 
    };

    // Return the result from TaskService.createTask
    return await TaskService.createTask(taskPayload, userId);
  }
}

module.exports = new ProjectService();