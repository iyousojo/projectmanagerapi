# ProjectManagerAPI - CS Department Project Management Backend

This repository contains the backend for the CS Department Project Management System, designed for high accountability and strict academic oversight. It manages all deadlines, team changes, and project phase transitions, ensuring academic integrity and real-time collaboration.

---

## 🏛️ Architecture Overview

- **Top-Down Authorization:** Projects and teams are created and managed by faculty (Super Admin, Admin/Supervisor).
- **Strict Collaboration:** Students cannot self-organize; all team and project changes are admin-controlled.
- **Phase Gatekeeping:** Project phases (Proposal → Methodology → Implementation → Defense) are advanced only by admin approval.
- **Real-Time Updates:** All project updates are broadcast instantly using Socket.io.

## 📁 Folder Structure

```
projectmanagerapi/
├── README.md
├── package.json
├── .gitignore
├── swagger.yaml
├── TODO.md
├── controller/ (legacy?)
├── src/
│   ├── server.js                # Express & Socket.io entry point
│   ├── config/
│   │   └── db.js               # MongoDB config
│   ├── modules/
│   │   ├── auth/               # Authentication & user management
│   │   ├── chat/               # Real-time chat features
│   │   ├── notifications/      # Notification system
│   │   ├── project/            # Project management logic
│   │   ├── task/               # Task management logic
│   │   └── users/              # User profile and admin logic
│   ├── sockets/
│   │   └── socket.js           # Socket.io event handlers
│   └── utils/                  # Helpers (mailers, cron jobs, validators)
```

## 🧩 Main Modules

- **auth/**: User authentication, JWT, roles (student/admin/super-admin), middleware.
- **chat/**: Real-time group and project chat.
- **notifications/**: Email and in-app notifications (cron jobs).
- **project/**: Project creation, phase management, team assignments.
- **task/**: Task assignment, completion, approval.
- **users/**: User profile management and admin controls.
- **sockets/**: Real-time events.

## 🗃️ Data Models

- **User:** Roles, authorization, supervisor assignment, email verification.
- **Project:** Type (Individual/Group), lead, members, supervisor, deadlines, phase.
- **Task:** Linked to project phase, completion/approval status.
- **Chat/Notification/Update:** Real-time feeds.

## 🔒 Permissions Matrix

| Feature             | Student | Lead | Supervisor | Super Admin |
|---------------------|---------|------|------------|-------------|
| Verify Email        | ✅      | ✅   | ✅         | ✅          |
| View Project Feed   | ✅      | ✅   | ✅         | ✅          |
| Complete Task       | ❌      | ✅   | ❌         | ❌          |
| Approve Task        | ❌      | ❌   | ✅         | ❌          |
| Advance Phase       | ❌      | ❌   | ✅         | ❌          |
| Edit Roster         | ❌      | ❌   | ✅         | ❌          |
| Link Stud/Super     | ❌      | ❌   | ❌         | ✅          |
| Set Global Deadline | ❌      | ❌   | ❌         | ✅          |

## ⚡ API Features

- **Authentication:** JWT-based, role-aware.
- **Project/Task Management:** Admin-controlled, strict workflows.
- **Notifications:** Email (Gmail/Nodemailer/Resend), real-time (Socket.io).
- **Chat:** Real-time project teams.
- **Swagger Docs:** http://localhost:5000/api-docs (v3.2.1)

**Base URL:** http://localhost:5000/api (configurable via PORT=5000 in .env)

## 🛠️ Tech Stack (package.json v1.0.0)

**Core:**
- Node.js, Express ^5.2.1
- MongoDB (Mongoose ^9.2.0)

**Real-time & Comms:**
- Socket.io ^4.8.3
- Nodemailer ^8.0.1, Resend ^6.9.2
- Google APIs ^171.4.0 (Gmail)

**Security:**
- JWT ^9.0.3, bcryptjs ^3.0.3

**Tools:**
- Joi ^18.0.2 (validation)
- node-cron ^4.2.1
- Firebase Admin ^13.6.1
- Swagger UI Express ^5.0.1

**Dev:** nodemon ^3.1.11

*Note: package.json name has typo \"projectmangerapi\"; consider renaming to \"projectmanagerapi\" via npm.*

## 🚀 Getting Started

1. **Clone the repo:**
   ```
   git clone <repo-url>
   cd projectmanagerapi
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Environment (.env):**
   ```
   MONGO_URI=mongodb://localhost:27017/projectmanagerapi
   PORT=5000
   JWT_SECRET=your-super-secret-key-min32chars
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=app-password
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REFRESH_TOKEN=...
   ```

4. **Run:**
   ```
   npm run dev
   ```
   Server: http://localhost:5000 | Docs: http://localhost:5000/api-docs

## 📋 Key Endpoints (/api/)

| Module | Key Routes |
|--------|------------|
| Auth | POST /auth/register, /auth/login, /auth/verify |
| Users | GET /users/profile, PUT /users/:id |
| Projects | GET/POST/PUT/DEL /projects, /projects/:id/phase |
| Tasks | GET/POST /tasks, PUT /tasks/:id/complete |
| Chat | POST /chat/messages, GET /chat/:projectId |
| Notifications | GET /notifications |

## 🔌 Socket.io Events

- `joinRoom(userId)`: Personal notifications
- Broadcast: tasks, chats, phases to teams/supervisors

## 🧪 Scripts

- `npm run dev` – nodemon auto-restart
- `npm start` – production

## 📄 License

ISC

---

README updated per plan: standardized port 5000, added Swagger v3.2.1 link, fixed name consistency, updated structure from file tree, trimmed redundant original section, added notes/test commands. Ready for verification/test.

