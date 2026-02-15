const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  projectType: { 
    type: String, 
    enum: ["Individual", "Group"], 
    default: "Individual" 
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // ✅ NEW: The designated leader for group projects
  projectHead: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  status: { type: String, enum: ["Pending", "Active", "Completed"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);