const UsersService = require("./users.service");

class UsersController {
  // 1. Get logged-in user details (Me)
  getProfile = async (req, res) => {
    try {
      const user = await UsersService.getProfile(req.user.id);
      res.json({ status: "success", user });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  // 2. GET /my-students OR /superadmin/students
  getStudentsList = async (req, res) => {
    try {
      const { status } = req.query; // 'assigned', 'unassigned'
      
      // If Admin, only show their students. If Super-Admin, show all based on query.
      const supervisorId = req.user.role === "admin" ? req.user.id : null;
      
      const students = await UsersService.getFilteredStudents(status, supervisorId);
      res.json({ status: "success", count: students.length, students });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  // 3. Get all Admins (For Super-Admin Postman route)
  getAllAdmins = async (req, res) => {
    try {
      const admins = await UsersService.getAllAdmins();
      res.json({ status: "success", count: admins.length, admins });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  // 4. Super-Admin or Admin: Pair a student with a supervisor
  authorizeStudent = async (req, res) => {
    try {
      const { studentId, supervisorId } = req.body;
      
      if (!studentId || !supervisorId) {
        return res.status(400).json({ 
          status: "error", 
          message: "Both studentId and supervisorId are required." 
        });
      }

      const user = await UsersService.authorizeStudent(studentId, supervisorId);
      res.json({ 
        status: "success", 
        message: "Student authorized and paired successfully", 
        user 
      });
    } catch (err) {
      // This will catch the "unverified" error from the service
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  // 5. Super-Admin: Dashboard Stats
  getAdminsDashboard = async (req, res) => {
    try {
      const stats = await UsersService.getSuperAdminStats();
      res.json({ status: "success", data: stats });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new UsersController();