const express = require("express");
const router = express.Router();
const User = require("./user.model");
const AuthController = require("./auth.controller");
const { protect } = require("./auth.middleware");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/profile", protect, AuthController.getProfile);

router.post("/verify-email", AuthController.verifyEmail);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Debugging routes
router.get("/debug-students", async (req, res) => {
  const students = await User.find({ role: "student" }).select("fullName email assignedSupervisor");
  res.json({ count: students.length, students });
});

module.exports = router;