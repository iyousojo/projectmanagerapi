const NotificationRepository = require("./notification.repository");

class NotificationController {
  getNotifications = async (req, res) => {
    try {
      const notifications = await NotificationRepository.getByUser(req.user._id);
      const unreadCount = await NotificationRepository.countUnread(req.user._id);
      res.json({ status: "success", unreadCount, notifications });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  markRead = async (req, res) => {
    try {
      await NotificationRepository.markAsRead(req.params.id);
      res.json({ status: "success", message: "Notification marked as read" });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  markAllRead = async (req, res) => {
    try {
      await NotificationRepository.markAllRead(req.user._id);
      res.json({ status: "success", message: "All notifications marked as read" });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new NotificationController();