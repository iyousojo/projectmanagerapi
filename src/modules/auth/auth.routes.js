const express = require("express");
const router = express.Router();
const AuthController = require("./auth.controller");
const { protect } = require("./auth.middleware");// Adjust path if needed

router.post("/register", (req, res, next) => AuthController.register(req, res, next));
router.post("/login", (req, res, next) => AuthController.login(req, res, next));

router.get("/profile", protect, (req, res, next) => AuthController.getProfile(req, res, next));

router.post("/verify-email", (req, res, next) => AuthController.verifyEmail(req, res, next));
router.post("/forgot-password", (req, res, next) => AuthController.forgotPassword(req, res, next));
router.post("/reset-password", (req, res, next) => AuthController.resetPassword(req, res, next));
router.get("/debug-students", async (req, res) => {
  const allUsers = await User.find({ role: "student" }).select("fullName email assignedSupervisor");
  res.json({
    message: "Debugging student assignments",
    count: allUsers.length,
    students: allUsers
  });
});
router.get("/check-db-raw", async (req, res) => {
  const students = await User.find({ role: "student" }).select("fullName email assignedSupervisor");
  res.json({
    message: "Raw DB check",
    students: students.map(s => ({
      name: s.fullName,
      email: s.email,
      supervisorInDB: s.assignedSupervisor,
      isMissingLink: !s.assignedSupervisor
    }))
  });
});
module.exports = router;