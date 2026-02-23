const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["student", "admin", "super-admin"], 
    default: "student" 
  },
  phone: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  faculty: { type: String },
  department: { type: String },
  expoPushToken: { type: String, default: null },
  profilePic: { type: String, default: "" },
  isAuthorized: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  assignedSupervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projectInfo: {
    currentPhase: { type: String, default: "Not Started" },
    daysRemaining: { type: Number, default: 0 },
    projectDescription: { type: String, default: "" }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// ✅ FIXED: Removed 'next' parameter. 
// When using async functions in Mongoose hooks, simply returning or throwing is enough.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error; 
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);