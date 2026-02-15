const express = require("express");
const router = express.Router();
const TaskController = require("./task.controller");
const { protect, roleMiddleware } = require("../auth/auth.middleware");

router.use(protect);

// 1. Get all tasks for a project
router.get("/project/:projectId", TaskController.getProjectTasks);

// 2. Create Task (Admin/Super-Admin only)
router.post("/", roleMiddleware(["admin"]), TaskController.createTask);

// 3. Submit Task (Student only)
router.put("/:id/submit", roleMiddleware(["student"]), TaskController.completeTask);

// 4. Approve Task (Admin/Super-Admin only)
router.put("/:id/approve", roleMiddleware(["admin"]), TaskController.approveTask);

module.exports = router;