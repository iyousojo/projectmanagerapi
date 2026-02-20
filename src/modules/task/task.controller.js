const TaskService = require("./task.service");

class TaskController {
  // ✅ ADDED: Handle fetching tasks by User ID
  getUserTasks = async (req, res) => {
    try {
      const tasks = await TaskService.getTasksByUser(req.params.userId);
      res.json(tasks); // Returning array directly to match your frontend .filter() logic
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
async createTask(data, adminId) {
  // 1. Check if a project was provided. If not, find the student's active project.
  let projectId = data.project;

  if (!projectId) {
    const activeProject = await Project.findOne({ 
      $or: [
        { projectHead: data.assignedTo },
        { members: data.assignedTo }
      ]
    });

    if (!activeProject) {
      throw new Error("This student is not linked to any project. Create a project first!");
    }
    projectId = activeProject._id;
  }

  // 2. Create the task with the found Project ID
  return await TaskRepository.create({ 
    ...data, 
    project: projectId, // ✅ Now the 'required' field is satisfied
    createdBy: adminId,
    status: "Pending"
  });
}

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