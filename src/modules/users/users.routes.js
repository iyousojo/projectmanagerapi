const express = require("express");
const router = express.Router();
const UsersController = require("./users.controller");
const { protect, roleMiddleware } = require("../auth/auth.middleware");

// All user management requires login
router.use(protect);

// Basic Profile
router.get("/me", UsersController.getProfile);

// Admin Routes: Manage assigned students
router.get("/my-students", roleMiddleware(["admin"]), UsersController.getStudentsList);
// Add this under router.get("/me", ...)
router.get("/", UsersController.getStudentsList);
// Super-Admin Routes: Authorize and Dashboards
router.post("/authorize", roleMiddleware(["super-admin"]), UsersController.authorizeStudent);
router.get("/superadmin/admins", roleMiddleware(["super-admin"]), UsersController.getAllAdmins);
router.get("/superadmin/dashboard", roleMiddleware(["super-admin"]), UsersController.getAdminsDashboard);
router.get("/superadmin/students", roleMiddleware(["super-admin"]), UsersController.getStudentsList);

module.exports = router;