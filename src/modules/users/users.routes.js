const express = require("express");
const router = express.Router();
const UsersController = require("./users.controller");
const { protect, roleMiddleware } = require("../auth/auth.middleware");

// --- MIDDLEWARE ---
// All routes below this line require a valid JWT token
router.use(protect);

// --- GENERAL ROUTES ---
router.get("/me", UsersController.getProfile);

// --- SUPER-ADMIN ONLY ROUTES ---
// Fetch all admins for the allocation portal
router.get(
  "/superadmin/admins", 
  roleMiddleware(["super-admin"]), 
  UsersController.getAllAdmins
);

// Fetch ALL students (unassigned/assigned) for the allocation portal
router.get(
  "/superadmin/students", 
  roleMiddleware(["super-admin"]), 
  UsersController.getStudentsList
);

// Main dashboard stats
router.get(
  "/superadmin/dashboard", 
  roleMiddleware(["super-admin"]), 
  UsersController.getAdminsDashboard
);

// Pairing logic
router.post(
  "/authorize", 
  roleMiddleware(["super-admin"]), 
  UsersController.authorizeStudent
);

// --- ADMIN ONLY ROUTES ---
// Fetch ONLY students assigned to the logged-in admin
router.get(
  "/my-students", 
  roleMiddleware(["admin"]), 
  UsersController.getStudentsList
);
router.patch(
  "/push-token", 
  UsersController.updatePushToken
);
module.exports = router;