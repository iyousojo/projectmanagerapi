const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ VERIFY HANDSHAKE MIDDLEWARE
// This will log every request from your phone to your VS Code terminal
app.use((req, res, next) => {
  console.log(`-----------------------------------------------`);
  console.log(`🔔 [${new Date().toLocaleTimeString()}] HANDSHAKE DETECTED`);
  console.log(`📱 IP: ${req.ip}`);
  console.log(`🔗 Path: ${req.originalUrl}`);
  console.log(`🛠️  Method: ${req.method}`);
  console.log(`-----------------------------------------------`);
  next();
});

// --- ROUTES ---
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const chatRoutes = require("./modules/chat/chat.routes");
const projectRoutes = require("./modules/project/project.routes");
const taskRoutes = require("./modules/task/task.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("API is running..."));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.message);
  res.status(err.status || 500).json({ status: "error", message: err.message });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const setupSocket = require("./sockets/socket");
setupSocket(io);
require("./utils/cron.jobs");

// --- UPDATED SERVER CONFIG ---
const PORT = 1000; 
const HOST = '0.0.0.0'; // Listen on all network interfaces

server.listen(PORT, HOST, () => {
  console.log(`
  🚀 Server is broadcasting!
  📡 Local:   http://localhost:${PORT}
  📱 Network: http://192.168.160.189:${PORT}
  
  Note: If the phone doesn't connect, ensure Windows Firewall 
  allows TCP traffic on Port 1000.
  `);
});