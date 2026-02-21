const UsersService = require("./users.service");
const User = require("../auth/user.model"); // Added this to prevent "User is not defined" error
const NotificationsService = require("../notifications/notification.service");

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
        console.log(`Admin Fetching Students for ID: ${req.user.id}`);
        students = await UsersService.getFilteredStudents(null, req.user.id);
      } else if (req.user.role === "super-admin") {
        students = await UsersService.getFilteredStudents("unassigned", null);
      } else {
        return res.status(403).json({ status: "error", message: "Unauthorized" });
      }
      
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
   * Logic: Links a student to a supervisor and notifies both.
   */
  authorizeStudent = async (req, res) => {
    try {
      const { studentId, supervisorId } = req.body;
      
      // Update the student record in DB
      const updatedStudent = await UsersService.authorizeStudent(studentId, supervisorId);
      
      // Fetch supervisor details to include their name in the notification
      const supervisor = await User.findById(supervisorId);

      // 1. Notify the Student
      await NotificationsService.createNotification({
        recipient: studentId,
        message: `Allocation Success: You have been assigned to Supervisor ${supervisor.fullName}.`,
        type: "assignment"
      });

      // 2. Notify the Admin/Supervisor
      await NotificationsService.createNotification({
        recipient: supervisorId,
        message: `New Assignment: Student ${updatedStudent.fullName} is now under your supervision.`,
        type: "assignment"
      });

      res.json({ status: "success", user: updatedStudent });
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
  updatePushToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      throw new Error("Token is required");
    }

    await User.findByIdAndUpdate(req.user._id, { 
      expoPushToken: token 
    });

    res.json({ 
      status: "success", 
      message: "Push token registered successfully" 
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};
}

module.exports = new UsersController();