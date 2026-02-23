const Chat = require("./chat.model");
const Project = require("../project/project.model");
const NotificationsService = require("../notifications/notification.service");

class ChatController {
  // Send Message
  sendMessage = async (req, res) => {
    try {
      const { projectId, receiverId, message } = req.body;
      const senderId = req.user._id;

      const chatData = {
        sender: senderId,
        message,
        createdAt: new Date(),
        // ✅ Standardized to projectId
        ...(projectId ? { projectId } : { receiver: receiverId })
      };

      const newChat = await Chat.create(chatData);
      const populatedChat = await Chat.findById(newChat._id).populate("sender", "fullName profilePic");

      // --- NOTIFICATION LOGIC ---
      if (projectId) {
        const project = await Project.findById(projectId);
        if (project) {
          const recipients = [
            project.supervisor, 
            project.projectHead, 
            ...(project.members || [])
          ].filter(id => id && id.toString() !== senderId.toString());

          const uniqueRecipients = [...new Set(recipients.map(r => r.toString()))];

          for (const userId of uniqueRecipients) {
            await NotificationsService.createNotification({
              recipient: userId,
              message: `[${project.title}] ${req.user.fullName}: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`,
              type: "info"
            });
          }
        }
      } else if (receiverId) {
        await NotificationsService.createNotification({
          recipient: receiverId,
          message: `${req.user.fullName} sent you a message: "${message.substring(0, 30)}..."`,
          type: "info"
        });
      }

      res.status(201).json({ status: "success", chat: populatedChat });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  // Get Messages
  getMessages = async (req, res) => {
    try {
      const { id } = req.params; 
      const { isProject } = req.query;
      const currentUserId = req.user._id;

      let query;
      if (isProject === "true") {
        // ✅ Use projectId to match the Schema
        query = { projectId: id };
      } else {
        query = {
          $or: [
            { sender: currentUserId, receiver: id },
            { sender: id, receiver: currentUserId }
          ],
          projectId: null // Ensure group chats don't leak into DMs
        };
      }

      const chat = await Chat.find(query)
        .sort({ createdAt: 1 })
        .populate("sender", "fullName profilePic");

      res.json({ status: "success", chat });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new ChatController();