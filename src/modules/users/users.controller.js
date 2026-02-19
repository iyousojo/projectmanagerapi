const UsersService = require("./users.service");

class UsersController {
  // GET /api/users/me
  getProfile = async (req, res) => {
    try {
      // Safety check: ensure 'protect' middleware passed the user
      if (!req.user || !req.user.id) {
        return res.status(401).json({ status: "error", message: "User not authenticated" });
      }

      const user = await UsersService.getProfile(req.user.id);
      
      // We wrap the user in an object to match the frontend 'userRes.data.user' logic
      res.json({ status: "success", user });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  // GET /api/users/my-students OR /api/users/superadmin/students
  getStudentsList = async (req, res) => {
    try {
      const { status } = req.query; 
      
      /**
       * ROLE LOGIC:
       * Admin: supervisorId = their own ID (filter for their assigned students)
       * Super-Admin: supervisorId = null (fetch all students)
       */
      const supervisorId = req.user.role === "admin" ? req.user.id : null;
      
      const students = await UsersService.getFilteredStudents(status, supervisorId);
      
      // Return array directly to satisfy 'setStudents(res.data)' on frontend
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
        return res.status(400).json({ status: "error", message: "Missing required IDs" });
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