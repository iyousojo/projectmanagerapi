# Project Management System - Backend API

A robust RESTful API built with Node.js, Express, and MongoDB to manage student projects, task tracking, and real-time notifications.

## 🚀 Features
- **Role-Based Access Control (RBAC)**: Distinct permissions for Students, Admins (Supervisors), and Super-Admins.
- **Project Lifecycle Management**: Tracks projects through phases (Pending -> Proposal -> Implementation -> Testing -> Completed).
- **Automated Task History**: Automatically logs milestones when project phases are updated.
- **Secure Authentication**: JWT-based authentication with protected middleware.

## 🛠️ API Architecture
The system follows a Controller-Service-Repository pattern for clean separation of concerns.

### Project Endpoints (`/api/projects`)
| Method | Endpoint | Access | Description |
|:--- |:--- |:--- |:--- |
| `POST` | `/` | Student/Admin | Create a new project. |
| `GET` | `/` | Auth Users | List projects (Filtered by role). |
| `GET` | `/:id` | Auth Users | Get full project details including tasks. |
| `PATCH`| `/:id` | Admin | Update project status/phase. |
| `POST` | `/:id/tasks` | Auth Users | Add a task or milestone to a project. |
| `DELETE`| `/:id` | Admin | Remove a project. |

## 🏗️ Data Models
### Project Model
- `title`: String (Required)
- `description`: String (Required)
- `status`: Enum (Pending, Proposal, Implementation, Testing, Completed)
- `supervisor`: Ref -> User
- `projectHead`: Ref -> User
- `members`: Array [Ref -> User]

### Task Model
- `title`: String
- `description`: String
- `project`: Ref -> Project (Required)
- `assignedTo`: Ref -> User (Required)