const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  // If it's a group chat
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project",
    default: null 
  },
  // If it's an individual chat
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    default: null 
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);