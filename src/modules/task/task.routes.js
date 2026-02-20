const express = require("express");
const router = express.Router();
const TaskController = require("./task.controller");
const { protect, roleMiddleware } = require("../auth/auth.middleware");

router.use(protect);

// Get tasks for specific user
router.get("/user/:userId", TaskController.getUserTasks);

// Get all tasks for a project
router.get("/project/:projectId", TaskController.getProjectTasks);

// Create Task
router.post("/", roleMiddleware(["admin", "super-admin"]), TaskController.createTask);
router.post("/project/:projectId", roleMiddleware(["admin", "super-admin"]), TaskController.createTask);

// Submit & Approve
router.put("/:id/submit", roleMiddleware(["student"]), TaskController.completeTask);
router.put("/:id/approve", roleMiddleware(["admin", "super-admin"]), TaskController.approveTask);

module.exports = router;