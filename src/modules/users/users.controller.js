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
   * - If role is 'super-admin', fetch unassigned students.
   */
  getStudentsList = async (req, res) => {
    try {
      let students;
      
      if (req.user.role === "admin") {
        // Log the ID to verify what the Admin is sending
        console.log(`Admin Fetching Students for ID: ${req.user.id}`);
        
        students = await UsersService.getFilteredStudents(null, req.user.id);
        
        console.log(`Found ${students ? students.length : 0} students for this Admin.`);
      } else if (req.user.role === "super-admin") {
        students = await UsersService.getFilteredStudents("unassigned", null);
      } else {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
      }
      
      // ✅ Safety: Always return an array
      res.status(200).json(Array.isArray(students) ? students : []);
    } catch (err) {
      console.error("Controller Error:", err.message);
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  /**
   * GET /api/users/superadmin/admins
   */
  getAllAdmins = async (req, res) => {
    try {
      const admins = await UsersService.getAllAdmins();
      res.status(200).json(admins);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  /**
   * POST /api/users/authorize
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