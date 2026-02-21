const Chat = require("./chat.model");

class ChatRepository {
  async createMessage(data) {
    return await (await Chat.create(data)).populate("sender", "fullName profilePic");
  }

  // Logic for Individual DMs
  async getDirectMessages(userId1, userId2) {
    return await Chat.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ],
      projectId: null // Ensure we don't grab group messages
    }).sort("createdAt").populate("sender", "fullName");
  }

  // Logic for Group/Project Chat
  async getProjectMessages(projectId) {
    return await Chat.find({ project: projectId })
      .sort("createdAt")
      .populate("sender", "fullName profilePic");
  }

  async markAsRead(messageId) {
    return await Chat.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }
}

module.exports = new ChatRepository();