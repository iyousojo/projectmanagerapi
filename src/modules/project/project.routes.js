const express = require("express");
const router = express.Router();
const ProjectController = require("./project.controller");
const { protect, roleMiddleware } = require("../auth/auth.middleware");

// Debugging: This will print 'true' if the function is loaded correctly
console.log("Is listProjects defined?:", typeof ProjectController.listProjects === 'function');

router.use(protect); 

router.post("/", roleMiddleware(["student", "admin"]), ProjectController.createProject);
router.get("/", ProjectController.listProjects); // Line 10
router.get("/:id", ProjectController.getProjectDetails);

router.post("/:id/tasks", roleMiddleware(["student", "admin"]), ProjectController.addTask);

router.patch("/:id", roleMiddleware(["admin"]), ProjectController.updateProject);
router.delete("/:id", roleMiddleware(["admin"]), ProjectController.deleteProject);

module.exports = router;