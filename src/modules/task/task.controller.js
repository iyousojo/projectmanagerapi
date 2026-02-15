const TaskService = require("./task.service");

class TaskController {
  createTask = async (req, res) => {
    try {
      const task = await TaskService.createTask(req.body, req.user._id);
      res.status(201).json({ status: "success", task });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  // ✅ ADDED: List tasks for a specific project
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