const ChatRepository = require("./chat.repository");
const Project = require("../project/project.model");
const mongoose = require("mongoose");

class ChatService {
  async sendMessage(senderId, receiver, projectId, message, senderRole) {
    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid Project ID format");
      }

      const project = await Project.findById(projectId);
      if (!project) throw new Error("Project not found");

      if (senderRole === "student") {
        const headId = project.projectHead?._id || project.projectHead;
        if (headId.toString() !== senderId.toString()) {
          throw new Error("Only the Project Head can send messages to the group.");
        }
      }
    }

    // ✅ Match Schema keys: Use projectId, not project
    const data = { 
      sender: senderId, 
      message: message, 
      ...(projectId ? { projectId: projectId } : { receiver: receiver }) 
    };

    return await ChatRepository.createMessage(data);
  }

  async fetchChatHistory(userId, targetId, isProject = false) {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        throw new Error("Invalid target ID format");
    }

    const history = isProject 
      ? await ChatRepository.getProjectMessages(targetId)
      : await ChatRepository.getDirectMessages(userId, targetId);
    
    return history;
  }
}

module.exports = new ChatService();