const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DEBUGGING LOGS ---
// This will tell us if any route file is exporting something broken
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const chatRoutes = require("./modules/chat/chat.routes");
const projectRoutes = require("./modules/project/project.routes");
const taskRoutes = require("./modules/task/task.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");

console.log("Checking Routers...");
console.log("Auth Router loaded:", typeof authRoutes === 'function' || typeof authRoutes?.stack === 'object');
console.log("Users Router loaded:", typeof usersRoutes === 'function' || typeof usersRoutes?.stack === 'object');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("API is running..."));

// Error handling middleware to catch the 'next' error before it crashes the app
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({ status: "error", message: err.message });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const setupSocket = require("./sockets/socket");
setupSocket(io);
require("./utils/cron.jobs");

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));