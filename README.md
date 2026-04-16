
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
src/
  server.js                # Express & Socket.io entry point
config/db.js             # MongoDB config
  modules/
    auth/                  # Authentication & user management
    chat/                  # Real-time chat features
    notifications/         # Notification system
    project/               # Project management logic
    task/                  # Task management logic
    users/                 # User profile and admin logic
  sockets/socket.js        # Socket.io event handlers
  utils/                   # Helpers (mailers, cron jobs, validators)
```

## 🧩 Main Modules

- **auth/**: User authentication, JWT, roles, and middleware.
- **chat/**: Real-time group and project chat.
- **notifications/**: Email and in-app notifications.
- **project/**: Project creation, phase management, and team assignments.
- **task/**: Task assignment, completion, and approval.
- **users/**: User profile management and admin controls.

## 🗃️ Data Models

- **User:** Roles (student, admin, super-admin), authorization, supervisor assignment, email verification.
- **Project:** Type (Individual/Group), lead, members, supervisor, deadlines, current phase.
- **Task:** Linked to project phase, completion and approval status.
- **Update:** Project timeline feed, real-time updates via Socket.io.

## 🔒 Permissions Matrix

| Feature             | Student | Lead | Supervisor | Super Admin |
|---------------------|---------|------|------------|-------------|
| Verify Email        | ✅      | ✅   | ✅         | ✅          |
| View Project Feed   | ✅      | ✅   | ✅         | ❌          |
| Complete Task       | ❌      | ✅   | ❌         | ❌          |
| Approve Task        | ❌      | ❌   | ✅         | ❌          |
| Advance Phase       | ❌      | ❌   | ✅         | ❌          |
| Edit Roster         | ❌      | ❌   | ✅         | ❌          |
| Link Stud/Super     | ❌      | ❌   | ❌         | ✅          |
| Set Global Deadline | ❌      | ❌   | ❌         | ✅          |

## ⚡ API Features

- **Authentication:** JWT-based, role-aware.
- **Project Management:** Admin-controlled creation, assignment, and phase advancement.
- **Task Management:** Lead-only completion, supervisor approval.
- **Notifications:** Email (Nodemailer), real-time (Socket.io).
- **Chat:** Real-time group chat for project teams.
- **Update Feed:** Automated and manual project updates.

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
- dotenv ^17.3.1, CORS ^2.8.6

**Dev:** nodemon ^3.1.11

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

3. **Configure environment (.env):**
   Create `.env` with:
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
   See `.env.example` after creation.

4. **Run the server:**
   ```
   npm run dev
   ```

   The server runs on the port specified in your `.env` file.

## 📋 API Endpoints (/api/)

| Module | Key Routes |
|--------|------------|
| Auth | POST /auth/register, /auth/login, /auth/verify |
| Users | GET /users/profile, PUT /users/:id/supervisor |
| Projects | GET/POST/PUT/DEL /projects, /projects/:id/phase |
| Tasks | GET/POST /tasks, PUT /tasks/:id/complete |
| Chat | POST /chat/messages, GET /chat/:projectId |
| Notifications | GET /notifications |

**Swagger Docs:** http://localhost:5000/api-docs

## 🔌 Socket.io

- `joinRoom(userId)`: Personal notifications
- Broadcast: task updates, chats, phase changes to teams/supervisors

## 🧪 Scripts

- `npm run dev` – Start server with nodemon (auto-restart on changes)
- `npm start` – Start server normally

## 📄 License

ISC

---

## Original Architecture & Logic (for reference)

> The following section preserves the original architecture and logic description for developer reference.

This is the comprehensive, production-ready blueprint for the CS Department Project Management System. This architecture balances academic rigor with collaborative flexibility, ensuring a strict chain of command.

🏗️ 1. Complete System Architecture
The backend uses a Layered Service-Oriented Architecture. This ensures that the "Rules" (like deadlines) are separated from the "Actions" (like updating a database).

Folder Structure (The Layout)

Plaintext
/cs-manager-api
├── server.js                # Entry point & Real-time Socket.io setup

├── .env                     # Secrets (JWT_SECRET, MONGO_URI, SMTP_PASS)

├── /src

│   ├── /config              # MongoDB (Mongoose) & Nodemailer Transporter

│   ├── /models              # Data Schemas (The "Truth" Layer)

│   ├── /middleware          # Security Gates (The "Protection" Layer)

│   │   ├── auth.js          # JWT & Email Verification check

│   │   ├── role.js          # Role-Based Access (Admin/SuperAdmin)

│   │   └── deadline.js      # Global Lockdown Logic

│   ├── /controllers         # Request Handlers (The "Action" Layer)

│   ├── /services            # Business Logic (The "Brain" Layer)

│   │   ├── email.service.js # Auto-notifications

│   │   └── task.service.js  # Validation for phase transitions

│   ├── /routes              # Endpoint Maps (Auth, Admin, Supervisor, Student)

│   └── /utils               # Helpers (Token Generators, Date Formatters)
📊 2. Strategic Data Models
A. User Model (Identity & Authorization)
role: student, admin, super-admin.

isVerified: Boolean (Requires email confirmation).

isAuthorized: Boolean (Critical: Set by Super Admin to "unlock" the student).

assignedSupervisor: Ref -> User (Admin).

B. Project Model (The Hub)
type: Individual or Group.

studentLead: Ref -> User (The "Head" - the only one who can submit work).

groupMembers: Array [Ref -> User] (Managed strictly by Admin).

deadline: Date (Compulsory; set during authorization).

currentPhase: Enum (Proposal, Methodology, Implementation, Defense).

C. Task Model (Granular Progress)
phase: String (e.g., "Implementation").

isCompletedByStudent: Boolean (Triggered by Student Lead).

isApprovedByAdmin: Boolean (Triggered by Supervisor).

🤝 3. Collaboration & Update System
The system encourages collaboration through a "Drop" Feed. This acts like a professional audit log and real-time message board.

Admin Drops: When an Admin adds/removes a member or approves a phase, the system "drops" an automated message: "Prof. Smith approved the Methodology phase."

Head Drops: The Student Lead can post status updates: "Draft 2 sent to supervisor's email for review."

Real-time Sync: Using Socket.io, when a Lead completes a task, the Supervisor gets an instant notification on their dashboard.

🔐 4. The Action-Permission Matrix
Action	Student Member	Student Lead (Head)	Supervisor (Admin)	Super Admin
Complete Task	❌ (View only)	✅	❌	❌

Approve Task	❌	❌	✅	❌

Manage Roster	❌	❌	✅	❌

Advance Phase	❌	❌	✅	❌


Authorize Student	❌	❌	❌	✅

Assign Supervisor	❌	❌	❌	✅

Set Project Deadline	❌	❌	❌	✅

🛡️ 5. Deadline & Security Enforcement
The Global Lockdown
The deadline.js middleware runs on every student request.

Logic: if (Date.now() > project.deadline) return 403 ("Project Period Expired").


Impact: Students can still log in to view their work (for history), but all "Write" actions (Completing tasks, posting updates) are frozen until the Super Admin grants an extension.


Strict Member Isolation
Admin Privacy: Supervisors cannot see any student records until the Super Admin performs the formal assignment.

Student Privacy: Students have no access to other students' projects, ensuring intellectual property remains within the assigned group.

📡 6. The "Intelligence" Payload (Login JSON)
The mobile app uses this specific response to build the UI dynamically.


JSON


{


  "status": "success",

  "token": "JWT_TOKEN",

  "user": {

    "name": "Alex",

    "role": "student",

    "isAuthorized": true

  },
  

  "project": {

    "projectId": "proj_99",

    "isLead": true,

    "currentPhase": "Methodology",

    "supervisor": "Dr. Miller",

    "deadline": "2026-08-01",

    "daysRemaining": 115,

    "tasksCompleted": 4,

    "tasksTotal": 10
  }

}

This architecture ensures that the Computer Science Department can maintain a high standard of oversight while giving students a modern, real-time platform to manage their research.
