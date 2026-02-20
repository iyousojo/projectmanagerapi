const express = require("express");
const router = express.Router();
const ProjectController = require("./project.controller");
const { protect, roleMiddleware } = require("../auth/auth.middleware");

// 1. All project routes require a logged-in user
router.use(protect); 

// 2. Create a project
router.post("/", roleMiddleware(["student", "admin"]), ProjectController.createProject);

// 3. List projects
router.get("/", ProjectController.listProjects);

// 4. Get specific project details
router.get("/:id", ProjectController.getProjectDetails);

// --- TASK & PROGRESS LOGS ---

// ✅ NEW: Add a task/log entry to a project (Both can post)
router.post(
    "/:id/tasks", 
    roleMiddleware(["student", "admin"]), 
    ProjectController.addTask
);

// --- ADMIN TOTAL CONTROL ROUTES ---

// 5. Update Project State (Status, Phase, Deadline, Description)
router.patch(
    "/:id", 
    roleMiddleware(["admin"]), 
    ProjectController.updateProject
);

// 6. Delete Project
router.delete(
    "/:id", 
    roleMiddleware(["admin"]), 
    ProjectController.deleteProject
);

router.post(
    "/:id/tasks", 
    roleMiddleware(["student", "admin"]), 
    ProjectController.addTask
);

module.exports = router;