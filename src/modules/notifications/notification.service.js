const NotificationRepository = require("./notification.repository");
const Project = require("../project/project.model");
const User = require("../auth/user.model");

class NotificationsService {
  socket = null; // store socket.io instance

  setSocket(io) {
    this.socket = io;
  }

  // 🔹 Base creator
  async createNotification({ recipient, message, type = "info" }) {
    const notification = await NotificationRepository.create({ recipient, message, type });

    // 🔔 Emit real-time notification if socket exists
    if (this.socket && recipient) {
      this.socket.to(recipient.toString()).emit("receiveNotification", notification);
    }

    return notification;
  }

  // ... rest of your methods (projectPhaseChanged, studentAssigned, etc.)
  async projectPhaseChanged(projectId, newPhase) {
    const project = await Project.findById(projectId).populate("lead").populate("members");
    if (!project) throw new Error("Project not found");

    const recipients = [project.lead?._id, ...project.members.map(m => m._id)].filter(Boolean);

    for (const userId of recipients) {
      await this.createNotification({
        recipient: userId,
        message: `Project "${project.title}" moved to "${newPhase}" phase.`,
        type: "info"
      });
    }
  }

  async studentAssigned(studentId, adminId) {
    const student = await User.findById(studentId);
    if (!student) throw new Error("Student not found");

    await this.createNotification({
      recipient: adminId,
      message: `${student.fullName} has been assigned to you.`,
      type: "assignment"
    });
  }

  async taskCompleted(task, adminId) {
    await this.createNotification({
      recipient: adminId,
      message: `Task "${task.title}" has been completed and awaits approval.`,
      type: "task"
    });
  }

  async taskApproved(task) {
    await this.createNotification({
      recipient: task.assignedTo,
      message: `Your task "${task.title}" has been approved.`,
      type: "task"
    });
  }

  async deadlineReminder(project) {
    const recipients = [project.lead, ...project.members].filter(Boolean);
    for (const userId of recipients) {
      await this.createNotification({
        recipient: userId,
        message: `Reminder: Project "${project.title}" deadline is approaching.`,
        type: "deadline"
      });
    }
  }

  async getNotifications(user) {
    return NotificationRepository.getByRecipient(user._id);
  }

  async markAsRead(notificationId) {
    return NotificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId) {
    return NotificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId) {
    return NotificationRepository.countUnread(userId);
  }
  // Add this inside your NotificationsService class
async supervisorAssignedToStudent(studentId, adminName) {
    await this.createNotification({
        recipient: studentId,
        message: `Success! ${adminName} has been assigned as your supervisor. You can now access your project.`,
        type: "assignment"
    });
}
}

module.exports = new NotificationsService();
