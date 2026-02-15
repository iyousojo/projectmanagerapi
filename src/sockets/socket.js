const NotificationsService = require("../modules/notifications/notification.service");

const setupSocket = (io) => {
  // Store the socket in NotificationsService for real-time notifications
  NotificationsService.setSocket(io);

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // User joins their personal room
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Optional: send chat messages
    socket.on("sendMessage", ({ senderId, receiverId, message }) => {
      io.to(receiverId).emit("receiveMessage", {
        senderId,
        message,
        createdAt: new Date(),
      });
    });

    // Optional: send manual notifications
    socket.on("sendNotification", ({ userId, title, body }) => {
      io.to(userId).emit("receiveNotification", { title, body, createdAt: new Date() });
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
};

module.exports = setupSocket;
