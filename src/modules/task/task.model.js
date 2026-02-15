const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ["Pending", "Submitted", "Approved"], 
    default: "Pending" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);