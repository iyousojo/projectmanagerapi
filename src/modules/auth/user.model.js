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
  gender: { type: String, enum: ["Male", "Female", "Other"], required: false },
  faculty: { type: String, required: false },
  department: { type: String, required: false },
  expoPushToken: { type: String, default: null },
  profilePic: { type: String, default: "" },
  isAuthorized: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  assignedSupervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projectInfo: {
    currentPhase: { type: String, default: "Not Started" },
    daysRemaining: { type: Number, default: 0 },
    projectDescription: { type: String, default: "" }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { 
  timestamps: true,
  validateBeforeSave: true 
});

// ✅ CORRECT: No 'next' parameter for async functions in modern Mongoose
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

userSchema.methods.generateEmailToken = function () {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationToken = token;
  return token;
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; 
  return resetToken; 
};

module.exports = mongoose.model("User", userSchema);