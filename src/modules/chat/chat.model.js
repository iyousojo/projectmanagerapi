const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // For Individual Chat
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  // For Group/Project Chat
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);