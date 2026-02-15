const ProjectService = require("./project.service");
const User = require("../auth/user.model"); 

class ProjectController {
  createProject = async (req, res) => {
    try {
      const { title, description, projectType, members = [] } = req.body;
      let supervisorId;

      if (req.user.role === "student") {
        const studentProfile = await User.findById(req.user._id);
        
        if (!studentProfile || !studentProfile.assignedSupervisor) {
          throw new Error("You are not authorized under any supervisor yet. Please contact an Admin.");
        }
        
        supervisorId = studentProfile.assignedSupervisor;
      } else {
        // Admins/Super-admins are their own supervisors
        supervisorId = req.user._id;
      }

      const projectData = {
        title,
        description,
        projectType,
        // Ensure student is always a member of their own project
        members: req.user.role === "student" ? [...new Set([...members, req.user._id.toString()])] : members,
        supervisor: supervisorId,
        // ✅ LOGIC: Assign head if provided, otherwise default to first member
         projectHead: req.body.projectHead || members[0]
      };

      const project = await ProjectService.createProject(projectData);
      res.status(201).json({ status: "success", project });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  listProjects = async (req, res) => {
    try {
      let projects;
      // Admins see projects they supervise; Students see projects they are members of
      if (req.user.role === "admin" || req.user.role === "super-admin") {
        projects = await ProjectService.getProjectsBySupervisor(req.user._id);
      } else {
        projects = await ProjectService.getProjectsByMember(req.user._id);
      }
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
}

module.exports = new ProjectController();