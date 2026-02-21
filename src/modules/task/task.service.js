const TaskRepository = require("./task.repository");

class TaskService {
async createTask(taskData, creatorId) {
    const finalData = { ...taskData, createdBy: creatorId };
    
    if (!finalData.project || !finalData.assignedTo) {
      throw new Error("Missing project ID or assigned student ID");
    }

    return await TaskRepository.create(finalData);
  }

  async getTasksByUser(userId) {
    if (!userId) throw new Error("User ID is required");
    
    console.log(`[SERVICE] Fetching tasks from Repo for user: ${userId}`);
    const tasks = await TaskRepository.findByUser(userId);
    
    if (!tasks || tasks.length === 0) {
      console.log(`[SERVICE] Warning: No tasks found for user: ${userId}`);
    }
    
    return tasks;
  }

  async getTasksByProject(projectId) {
    return await TaskRepository.findByProject(projectId);
  }

 async submitTask(taskId, studentId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new Error("Task not found");
    
    // SAFE ID COMPARISON
    const assignedId = task.assignedTo._id || task.assignedTo;
    if (!assignedId.equals(studentId)) {
      throw new Error("Unauthorized: You are not assigned to this task");
    }

    return await TaskRepository.update(taskId, { status: "Submitted" });
  }

  async approveTask(taskId) {
    return await TaskRepository.update(taskId, { status: "Approved" });
  }
}

module.exports = new TaskService();