const ProjectService = require("./project.service");
const User = require("../auth/user.model");
const NotificationsService = require("../notifications/notification.service");

class ProjectController {
  createProject = async (req, res) => {
    try {
      const { title, description, projectType, members = [] } = req.body;
      let supervisorId;

      if (req.user.role === "student") {
        const studentProfile = await User.findById(req.user._id);
        if (!studentProfile || !studentProfile.assignedSupervisor) {
          throw new Error("You are not authorized under any supervisor yet.");
        }
        supervisorId = studentProfile.assignedSupervisor;
      } else {
        supervisorId = req.user._id;
      }

      const projectData = {
        title,
        description,
        projectType,
        members: req.user.role === "student" ? [...new Set([...members, req.user._id.toString()])] : members,
        supervisor: supervisorId,
        projectHead: req.body.projectHead || (members.length > 0 ? members[0] : req.user._id)
      };

      const project = await ProjectService.createProject(projectData);
      res.status(201).json({ status: "success", project });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  listProjects = async (req, res) => {
    try {
      let projects = (req.user.role === "admin" || req.user.role === "super-admin") 
        ? await ProjectService.getProjectsBySupervisor(req.user._id)
        : await ProjectService.getProjectsByMember(req.user._id);
      res.json({ status: "success", count: projects.length, projects });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  getProjectDetails = async (req, res) => {
    try {
      const project = await ProjectService.getProjectById(req.params.id, req.user._id, req.user.role);
      res.json({ status: "success", project });
    } catch (err) {
      res.status(404).json({ status: "error", message: err.message });
    }
  };

  addTask = async (req, res) => {
    try {
      const { id } = req.params;
      const newTask = await ProjectService.addTask(id, req.body, req.user._id);
      res.status(201).json({ status: "success", task: newTask });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  updateProject = async (req, res) => {
    try {
      const updatedProject = await ProjectService.updateProject(req.params.id, req.body, req.user._id);
      res.json({ status: "success", project: updatedProject });
    } catch (err) {
      res.status(403).json({ status: "error", message: err.message });
    }
  };

  deleteProject = async (req, res) => {
    try {
      await ProjectService.deleteProject(req.params.id, req.user._id);
      res.json({ status: "success", message: "Project deleted" });
    } catch (err) {
      res.status(403).json({ status: "error", message: err.message });
    }
  };
}

// Ensure this is the ONLY export in the file and it's at the very bottom
module.exports = new ProjectController();