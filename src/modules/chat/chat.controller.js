const ChatService = require("./chat.service");

class ChatController {
  sendMessage = async (req, res) => {
    try {
      // Destructure senderRole along with other fields
      const { receiver, projectId, message, senderRole } = req.body;
      const sender = req.user.id;
      
      // Order must match Service: (senderId, receiver, projectId, message, senderRole)
      const chat = await ChatService.sendMessage(
        sender, 
        receiver, 
        projectId, 
        message, 
        senderRole
      );
      
      return res.json({ status: "success", chat });
    } catch (err) {
      // Log error for internal debugging
      console.error("ChatController Error:", err.message);
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  getMessages = async (req, res) => {
    try {
      const { targetId } = req.params;
      const { isProject } = req.query;
      
      const chat = await ChatService.fetchChatHistory(
        req.user.id, 
        targetId, 
        isProject === "true"
      );
      return res.json({ status: "success", chat });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };
}

module.exports = new ChatController();