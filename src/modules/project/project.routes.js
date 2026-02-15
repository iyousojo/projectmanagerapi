const express = require("express");
const router = express.Router();
const ProjectController = require("./project.controller");
const { protect, roleMiddleware } = require("../auth/auth.middleware");

// 1. All project routes require a logged-in user
router.use(protect); 

// 2. Create a project (Logic: Students or Admins only)
router.post("/", roleMiddleware(["student", "admin"]), ProjectController.createProject);

// 3. List projects (Logic: Returns supervised projects for Admins, joined projects for Students)
router.get("/", ProjectController.listProjects);

// 4. Get specific project details (Logic: Includes security check in the service)
router.get("/:id", ProjectController.getProjectDetails);

module.exports = router;