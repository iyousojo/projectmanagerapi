const Chat = require("./chat.model");

class ChatController {
  // Send Message
  sendMessage = async (req, res) => {
    try {
      const { projectId, receiverId, message } = req.body;
      const senderId = req.user._id;

      const chatData = {
        sender: senderId,
        message,
        createdAt: new Date()
      };

      if (projectId) {
        chatData.projectId = projectId;
      } else {
        chatData.receiver = receiverId;
      }

      const newChat = await Chat.create(chatData);
      const populatedChat = await Chat.findById(newChat._id).populate("sender", "fullName profilePic");

      res.status(201).json({ status: "success", chat: populatedChat });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  };

  // Get Messages
  getMessages = async (req, res) => {
    try {
      const { id } = req.params; // This is either ProjectID or OtherUserID
      const { isProject } = req.query;
      const currentUserId = req.user._id;

      let query;
      if (isProject === "true") {
        query = { projectId: id };
      } else {
        // Find messages where (Me -> Them) OR (Them -> Me)
        query = {
          $or: [
            { sender: currentUserId, receiver: id },
            { sender: id, receiver: currentUserId }
          ]
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