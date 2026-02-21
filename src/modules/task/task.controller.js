const TaskService = require("./task.service");
const Project = require("../project/project.model"); // Added missing import
const NotificationsService = require("../notifications/notification.service");

class TaskController {
  getUserTasks = async (req, res) => {
    try {
      console.log(`[BACKEND] Fetching tasks for userId: ${req.params.userId}`);
      const tasks = await TaskService.getTasksByUser(req.params.userId);
      res.json(tasks);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  createTask = async (req, res) => {
    try {
      const projectId = req.params.projectId || req.body.project || req.body.projectId;
      const taskData = { ...req.body, project: projectId };
      const task = await TaskService.createTask(taskData, req.user._id);

      // --- NEW NOTIFICATION ---
      // Notify the student that they have been assigned a new task
      if (task.assignedTo) {
        await NotificationsService.createNotification({
          recipient: task.assignedTo,
          message: `New Task Assigned: "${task.title}". Check your workspace for details.`,
          type: "task"
        });
      }

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

  /**
   * Action: Student marks task as finished.
   * Target: Supervisor/Admin
   */
  completeTask = async (req, res) => {
    try {
      const task = await TaskService.submitTask(req.params.id, req.user._id);
      const project = await Project.findById(task.project);

      if (project && project.supervisor) {
        // Notify the Supervisor/Admin that a task needs review
        await NotificationsService.createNotification({
          recipient: project.supervisor,
          message: `Review Required: "${task.title}" has been submitted by ${req.user.fullName}.`,
          type: "task"
        });
      }

      res.json({ status: "success", task });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  /**
   * Action: Admin/Supervisor approves the work.
   * Target: Assigned Student
   */
  approveTask = async (req, res) => {
    try {
      const task = await TaskService.approveTask(req.params.id);
      
      if (task.assignedTo) {
        // Notify the Student who was assigned the task
        await NotificationsService.createNotification({
          recipient: task.assignedTo,
          message: `Well done! Your task "${task.title}" has been approved.`,
          type: "task"
        });
      }

      res.json({ status: "success", task });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new TaskController();