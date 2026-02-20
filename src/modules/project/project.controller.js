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
      let projects;
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

  // --- NEW: ADMIN TOTAL CONTROL METHODS ---

  /**
   * ✅ Update Project (Phase, Status, Deadline, etc.)
   * Used by Admins to manage the project lifecycle.
   */
  updateProject = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Passing req.user._id to ensure only the supervisor of THIS project can edit it
      const updatedProject = await ProjectService.updateProject(id, updateData, req.user._id);
      
      res.json({ 
        status: "success", 
        message: "Project state updated successfully", 
        project: updatedProject 
      });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  /**
   * ✅ Delete Project
   * Permanently removes the project record.
   */
  deleteProject = async (req, res) => {
    try {
      const { id } = req.params;
      
      await ProjectService.deleteProject(id, req.user._id);
      
      res.json({ 
        status: "success", 
        message: "Project deleted permanently" 
      });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new ProjectController();