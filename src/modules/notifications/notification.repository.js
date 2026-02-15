const Notification = require("./notification.model");

class NotificationRepository {
  async create({ recipient, message, type }) {
    return await Notification.create({
      recipient,
      message,
      type,
      isRead: false
    });
  }

  async getByUser(userId) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async countUnread(userId) {
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId, 
      { isRead: true }, 
      { new: true }
    );
  }

  async markAllRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false }, 
      { isRead: true }
    );
  }
}

module.exports = new NotificationRepository();