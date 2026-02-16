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
  
  // ✅ NEW FIELDS ADDED
  gender: { 
    type: String, 
    enum: ["Male", "Female", "Other"], 
    required: false // Set to true if you want to force this selection
  },
  faculty: { type: String, required: false },
  department: { type: String, required: false },

  profilePic: String,
  isAuthorized: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  assignedSupervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projectInfo: {
    currentPhase: { type: String, default: "Not Started" },
    daysRemaining: { type: Number, default: 0 },
    projectDescription: String
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// --- Middleware & Methods ---

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateEmailToken = function () {
  const token = crypto.randomBytes(20).toString("hex");
  this.emailVerificationToken = token;
  return token;
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);