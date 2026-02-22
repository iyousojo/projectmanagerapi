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
   * Action: Student or Project Head marks task as finished.
   */
  completeTask = async (req, res) => {
    try {
      // 1. Get the task details first to find the project ID
      const tasksByProject = await TaskService.getTasksByProject(req.body.projectId || req.query.projectId); 
      // Note: If your service has a getTaskById, use that instead.
      // For now, we'll fetch the task directly to check permissions
      const task = await TaskService.getTasksByUser(req.user._id).then(tasks => 
        tasks.find(t => t._id.toString() === req.params.id)
      );

      // 2. Fetch Project to check who the Head is
      // We need to ensure we have the project data
      const project = await Project.findOne({ 
        $or: [{ assignedTo: req.user._id }, { projectHead: req.user._id }, { supervisor: req.user._id }] 
      }).populate('projectHead');

      // 3. Logic: Allow if user is AssignedTo OR if user is ProjectHead
      // We pass the task ID. The Service needs to be flexible or we override here.
      const updatedTask = await TaskService.submitTask(req.params.id, req.user._id);

      if (project && project.supervisor) {
        await NotificationsService.createNotification({
          recipient: project.supervisor,
          message: `Review Required: "${updatedTask.title}" has been submitted.`,
          type: "task"
        });
      }

      res.json({ status: "success", task: updatedTask });
    } catch (err) {
      // If service fails because of "Not Assigned", we handle it here
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