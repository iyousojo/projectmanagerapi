const express = require("express");
const router = express.Router();
const TaskController = require("./task.controller");
const { protect, roleMiddleware } = require("../auth/auth.middleware");

router.use(protect);

// ✅ ADDED: Get tasks for a specific user (Matches your frontend call)
router.get("/user/:userId", TaskController.getUserTasks);

// 1. Get all tasks for a project
router.get("/project/:projectId", TaskController.getProjectTasks);

// 2. Create Task (Admin & Super-Admin)
router.post("/", roleMiddleware(["admin", "super-admin"]), TaskController.createTask);

// 3. Submit Task (Student only)
router.put("/:id/submit", roleMiddleware(["student"]), TaskController.completeTask);

// 4. Approve Task (Admin & Super-Admin)
router.put("/:id/approve", roleMiddleware(["admin", "super-admin"]), TaskController.approveTask);
// task.router.js

// Add this route to handle the project-specific task creation
router.post("/project/:projectId", roleMiddleware(["admin", "super-admin"]), TaskController.createTask);

module.exports = router;