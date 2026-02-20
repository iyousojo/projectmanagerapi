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

  createTask = async (req, res) => {
    try {
      // ✅ JUST call the service. The service handles the project logic.
      const task = await TaskService.createTask(req.body, req.user._id);
      res.status(201).json({ status: "success", task });
    } catch (err) {
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