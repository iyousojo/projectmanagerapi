const Project = require("./project.model");

class ProjectRepository {
  async create(data) {
    return await Project.create(data);
  }

  async findBySupervisor(supervisorId) {
    return await Project.find({ supervisor: supervisorId }).populate("members", "fullName email");
  }

  async findByMember(userId) {
    return await Project.find({ members: userId }).populate("supervisor", "fullName email");
  }

  async findById(id) {
    return await Project.findById(id).populate("members supervisor", "fullName email")
    .populate("members", "fullName email profilePic")
    .populate("projectHead", "fullName email")
    .populate("supervisor", "fullName email");
  }
}

module.exports = new ProjectRepository();