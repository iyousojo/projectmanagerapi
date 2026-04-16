const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors"); // Added CORS
const { Server } = require("socket.io");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

dotenv.config();

const app = express();

// --- MIDDLEWARE ---
// Critical: CORS must be configured so your Netlify bridge can call your API
app.use(cors({
  origin: "*", // For production, replace "*" with your Netlify URL
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DEBUGGING LOGS ---
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const chatRoutes = require("./modules/chat/chat.routes");
const projectRoutes = require("./modules/project/project.routes");
const taskRoutes = require("./modules/task/task.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");

console.log("Checking Routers...");
console.log("Auth Router loaded:", typeof authRoutes === 'function' || !!authRoutes?.stack);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
// Mount under a different route if you have multiple APIs running
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));