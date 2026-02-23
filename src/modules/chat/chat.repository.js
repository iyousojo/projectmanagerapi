const Chat = require("./chat.model");

class ChatRepository {
  async createMessage(data) {
    const newChat = await Chat.create(data);
    return await Chat.findById(newChat._id).populate("sender", "fullName profilePic");
  }

  // Logic for Individual DMs
  async getDirectMessages(userId1, userId2) {
    return await Chat.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ],
      projectId: null 
    }).sort("createdAt").populate("sender", "fullName profilePic");
  }

  // Logic for Group/Project Chat
  async getProjectMessages(projectId) {
    // ✅ Changed 'project' to 'projectId'
    return await Chat.find({ projectId: projectId })
      .sort("createdAt")
      .populate("sender", "fullName profilePic");
  }

  async markAsRead(messageId) {
    return await Chat.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }
}

module.exports = new ChatRepository();