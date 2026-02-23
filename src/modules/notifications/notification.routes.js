const express = require("express");
const router = express.Router();
const NotificationController = require("./notification.controller");

// 🚩 FIX: Point to the new unified middleware and use 'protect'
const { protect } = require("../auth/auth.middleware");

// Protect all notification routes
router.use(protect);

router.get("/", NotificationController.getNotifications);
router.put("/read-all", NotificationController.markAllRead);
router.put("/:id/read", NotificationController.markRead);
router.delete("/:id", NotificationController.deleteNotification);

module.exports = router;