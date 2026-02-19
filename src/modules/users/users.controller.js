// users.controller.js
const UsersService = require("./users.service");

class UsersController {
  getProfile = async (req, res) => {
    try {
      const user = await UsersService.getProfile(req.user.id);
      res.json({ status: "success", user });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  getStudentsList = async (req, res) => {
    try {
      const { status } = req.query; // e.g., ?status=unassigned
      
      /**
       * ROLE LOGIC:
       * 1. If user is 'admin', we MUST pass their ID to filter the database.
       * 2. If user is 'super-admin', we pass null so they can see everyone.
       */
      const supervisorId = req.user.role === "admin" ? req.user.id : null;
      
      const students = await UsersService.getFilteredStudents(status, supervisorId);
      
      // Sending back the array directly helps avoid Frontend mapping errors
      res.status(200).json(students);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  getAllAdmins = async (req, res) => {
    try {
      const admins = await UsersService.getAllAdmins();
      res.status(200).json(admins);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  authorizeStudent = async (req, res) => {
    try {
      const { studentId, supervisorId } = req.body;
      if (!studentId || !supervisorId) {
        return res.status(400).json({ message: "Missing studentId or supervisorId" });
      }
      const user = await UsersService.authorizeStudent(studentId, supervisorId);
      res.json({ status: "success", user });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  getAdminsDashboard = async (req, res) => {
    try {
      const stats = await UsersService.getSuperAdminStats();
      res.json(stats);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new UsersController();