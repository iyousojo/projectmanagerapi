const ChatRepository = require("./chat.repository");
const Project = require("../project/project.model");

class ChatService {
  async sendMessage(senderId, senderRole, receiver, projectId, message) {
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) throw new Error("Project not found");

      // ✅ LOGIC: If student is sending to a group, they MUST be the head
      if (senderRole === "student") {
        if (project.projectHead.toString() !== senderId.toString()) {
          throw new Error("Only the Project Head can send messages to the group.");
        }
      }
    }

    const data = { 
      sender: senderId, 
      message, 
      ...(projectId ? { project: projectId } : { receiver }) 
    };

    return await ChatRepository.createMessage(data);
  }

  async fetchChatHistory(userId, targetId, isProject = false) {
    const history = isProject 
      ? await ChatRepository.getProjectMessages(targetId)
      : await ChatRepository.getDirectMessages(userId, targetId);
    
    return history;
  }
}

module.exports = new ChatService();