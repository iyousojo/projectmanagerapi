const ChatService = require("./chat.service");

class ChatController {
  sendMessage = async (req, res) => {
    try {
      const { receiver, projectId, message } = req.body;
      const sender = req.user.id;
      
      const chat = await ChatService.sendMessage(sender, receiver, projectId, message);
      return res.json({ status: "success", chat });
    } catch (err) {
      return res.status(400).json({ status: "error", message: err.message });
    }
  };

  getMessages = async (req, res) => {
    try {
      const { targetId } = req.params; // Can be a UserID or ProjectID
      const { isProject } = req.query; // Pass ?isProject=true for group chats
      
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