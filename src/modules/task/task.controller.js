const TaskService = require("./task.service");

class TaskController {
 getUserTasks = async (req, res) => {
    try {
      const tasks = await TaskService.getTasksByUser(req.params.userId);
      res.json(tasks);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
// task.controller.js

createTask = async (req, res) => {
  try {
    // Get projectId from params (if using /project/:projectId) or from body
    const projectId = req.params.projectId || req.body.project || req.body.projectId;
    
    // Combine the data
    const taskData = { ...req.body, project: projectId };

    const task = await TaskService.createTask(taskData, req.user._id);
    res.status(201).json({ status: "success", task });
  } catch (err) {
    // This is where "Project is not defined" usually triggers if the Service fails
    res.status(400).json({ status: "error", message: err.message });
  }
};
  getProjectTasks = async (req, res) => {
    try {
      const tasks = await TaskService.getTasksByProject(req.params.projectId);
      res.json({ status: "success", count: tasks.length, tasks });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  completeTask = async (req, res) => {
    try {
      const task = await TaskService.submitTask(req.params.id, req.user._id);
      res.json({ status: "success", message: "Task submitted for approval", task });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  approveTask = async (req, res) => {
    try {
      const task = await TaskService.approveTask(req.params.id, req.user._id);
      res.json({ status: "success", message: "Task approved", task });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new TaskController();