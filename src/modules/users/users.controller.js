const UsersService = require("./users.service");

class UsersController {
  // GET /api/users/me
  getProfile = async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ status: "error", message: "User not authenticated" });
      }

      const user = await UsersService.getProfile(req.user.id);
      res.json({ status: "success", user });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  /**
   * Updated getStudentsList
   * Logic: 
   * - If role is 'admin', fetch only their students.
   * - If role is 'super-admin', fetch students without a supervisor (unassigned).
   */
  getStudentsList = async (req, res) => {
    try {
      let students;
      
      if (req.user.role === "admin") {
        // Supervisors see their specifically assigned students
        students = await UsersService.getFilteredStudents(null, req.user.id);
      } else if (req.user.role === "super-admin") {
        // Super Admin sees ALL students who don't have a supervisor yet
        // We pass 'unassigned' as a flag to the service
        students = await UsersService.getFilteredStudents("unassigned", null);
      } else {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
      }
      
      // Return the array directly to satisfy the frontend's: setStudents(res.data)
      res.status(200).json(students);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  /**
   * GET /api/users/superadmin/admins
   * Used by Super Admin to see available supervisors for allocation
   */
  getAllAdmins = async (req, res) => {
    try {
      const admins = await UsersService.getAllAdmins();
      // Returns array: [{_id, fullName, studentCount, department...}]
      res.status(200).json(admins);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  /**
   * POST /api/users/authorize
   * Links a Student to a Supervisor
   */
  authorizeStudent = async (req, res) => {
    try {
      const { studentId, supervisorId } = req.body;
      
      if (!studentId || !supervisorId) {
        return res.status(400).json({ status: "error", message: "Student ID and Supervisor ID are required" });
      }

      const updatedStudent = await UsersService.authorizeStudent(studentId, supervisorId);
      
      res.json({ 
        status: "success", 
        message: "Allocation successful", 
        user: updatedStudent 
      });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  /**
   * GET /api/users/superadmin/dashboard
   */
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