# ProjectPulse 🚀

> A full-stack MERN project management and collaboration platform built for student teams.

ProjectPulse is a collaborative workspace designed to help student teams organize their college projects, divide tasks, manage team members, and track project progress from one place.

It provides a simple project management workflow where users can create projects, invite or add teammates using a project join code, create and assign tasks, and manage tasks through a Kanban-style board.

---

## 🔗 Project Links

### 🌐 Live Demo

https://project-pulse-three-xi.vercel.app/

### 💻 GitHub Repository

https://github.com/sharvani-karnam/Project-Pulse

---

## 📌 Problem Statement

Student teams often manage college projects using a combination of WhatsApp groups, spreadsheets, notes, and other disconnected tools.

This can make it difficult to:

- Know who is working on each task
- Track the overall progress of a project
- Assign responsibilities clearly
- Understand which tasks are completed or pending
- Coordinate work between multiple team members
- Keep project information organized

ProjectPulse addresses this problem by providing a centralized workspace where student teams can manage their projects and tasks.

---

## 💡 Solution

ProjectPulse provides a web-based project management system where users can:

- Create and manage projects
- Add team members using a unique project join code
- View project members
- Create tasks
- Assign tasks to team members
- Set task priorities
- Set task due dates
- Track task status
- Move tasks between Kanban columns
- Update and delete projects and tasks
- Access their projects from a centralized dashboard

The application follows a MERN architecture consisting of:

- MongoDB
- Express.js
- React
- Node.js

Authentication is handled using JWT, while passwords are securely hashed using bcrypt.

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes
- Authentication state management

### 📁 Project Management

- Create projects
- View projects
- View individual project details
- Update project information
- Delete projects
- Project ownership
- Unique project join codes

### 👥 Team Management

- Join a project using a unique join code
- View project team members
- Identify the project owner
- Remove members from a project
- Project-specific team membership

### ✅ Task Management

- Create tasks inside projects
- Assign tasks to project members
- Set task priority
- Set task status
- Set due dates
- Update tasks
- Delete tasks
- View tasks belonging to a project

### 📋 Kanban Board

ProjectPulse provides a simple Kanban-style workflow with three task columns:

- TODO
- IN PROGRESS
- DONE

Tasks can be moved between columns using drag-and-drop or the status selector, with changes saved to the backend.

### 🎨 User Interface

- Clean and modern interface
- Dashboard-based navigation
- Project cards
- Task cards
- Kanban board
- Responsive layouts
- Consistent visual design

---

## 🛠️ Tech Stack

### Frontend

- React.js — User interface
- Vite — Frontend development and build tool
- React Router — Client-side routing
- JavaScript — Application logic
- CSS — Styling and responsive design

### Backend

- Node.js — Server-side JavaScript runtime
- Express.js — REST API framework
- JWT — Authentication
- bcrypt — Password hashing

### Database

- MongoDB — NoSQL database
- Mongoose — MongoDB object modeling

### Development & Deployment

- Git — Version control
- GitHub — Source code hosting
- Vercel — Frontend deployment
- Render — Backend deployment
- MongoDB Atlas — Cloud database hosting

---

## 🏗️ Architecture

ProjectPulse follows a three-layer MERN architecture.

    ┌───────────────────────────────┐
    │          React Frontend       │
    │                               │
    │  Pages → Components → API     │
    └───────────────┬───────────────┘
                    │
                    │ HTTP Requests
                    │ REST API
                    ▼
    ┌───────────────────────────────┐
    │       Node.js + Express       │
    │                               │
    │ Routes → Middleware → Logic   │
    └───────────────┬───────────────┘
                    │
                    │ Mongoose
                    ▼
    ┌───────────────────────────────┐
    │          MongoDB              │
    │                               │
    │ Users → Projects → Tasks      │
    └───────────────────────────────┘

The frontend communicates with the Express backend through REST APIs.

The backend handles authentication, authorization, project operations, and task operations.

MongoDB stores users, projects, team memberships, and tasks.

---

## 📂 Project Structure

    Project-Pulse/
    │
    ├── backend/
    │   ├── config/
    │   │   └── db.js
    │   │
    │   ├── middleware/
    │   │   └── authMiddleware.js
    │   │
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Project.js
    │   │   └── Task.js
    │   │
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── projectRoutes.js
    │   │   └── taskRoutes.js
    │   │
    │   ├── .env
    │   ├── .env.example
    │   ├── package.json
    │   └── server.js
    │
    ├── frontend/
    │   ├── public/
    │   │
    │   └── src/
    │       ├── components/
    │       │   ├── Kanban.jsx
    │       │   ├── Navbar.jsx
    │       │   ├── ProtectedRoute.jsx
    │       │   ├── TaskCard.jsx
    │       │   └── TaskForm.jsx
    │       │
    │       ├── config/
    │       │   └── api.js
    │       │
    │       ├── pages/
    │       │   ├── Dashboard.jsx
    │       │   ├── Landing.jsx
    │       │   ├── Login.jsx
    │       │   ├── ProjectDetails.jsx
    │       │   └── Register.jsx
    │       │
    │       ├── App.jsx
    │       ├── main.jsx
    │       └── index.css
    │
    ├── .gitignore
    ├── README.md
    └── package files

---

## 🔄 Application Workflow

The main workflow of ProjectPulse is:

    User
     │
     ▼
    Landing Page
     │
     ├── Register
     │      │
     │      ▼
     │   Create Account
     │
     └── Login
            │
            ▼
       JWT Authentication
            │
            ▼
         Dashboard
            │
            ▼
       Select Project
            │
            ▼
      Project Details
            │
            ├── View Team
            │
            ├── Join Project
            │
            ├── Create Task
            │
            └── Manage Tasks
                     │
                     ▼
                Kanban Board
                     │
            ┌────────┼────────┐
            ▼        ▼        ▼
           TODO   IN PROGRESS  DONE

---

## 🔐 Authentication Flow

ProjectPulse uses JWT-based authentication.

### 1. Registration

A new user enters their details on the registration page.

The frontend sends the information to:

    POST /api/auth/register

The backend:

1. Receives the registration request.
2. Validates the user information.
3. Hashes the password using bcrypt.
4. Creates the user document in MongoDB.
5. Returns the appropriate response.

---

### 2. Login

The user enters their email and password.

The frontend sends the credentials to:

    POST /api/auth/login

The backend:

1. Finds the user.
2. Compares the entered password with the hashed password.
3. Generates a JWT if the credentials are valid.
4. Returns the authentication token.

The frontend stores the token and uses it when making protected API requests.

---

### 3. Protected Routes

Protected backend routes use authentication middleware.

The middleware:

1. Reads the JWT from the request.
2. Verifies the token.
3. Identifies the authenticated user.
4. Allows the request to continue if the token is valid.
5. Rejects unauthorized requests.

This prevents users from accessing protected project and task operations without authentication.

---

## 🌐 REST API

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login a user |
| GET | /api/auth/me | Get authenticated user |

### Project Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/projects | Create a project |
| GET | /api/projects | Get user's projects |
| GET | /api/projects/:id | Get project details |
| PUT | /api/projects/:id | Update a project |
| DELETE | /api/projects/:id | Delete a project |
| POST | /api/projects/join | Join project using join code |
| DELETE | /api/projects/:id/members/:memberId | Remove a project member |

### Task Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/projects/:projectId/tasks | Create a task |
| GET | /api/projects/:projectId/tasks | Get project tasks |
| GET | /api/tasks/:id | Get a task |
| PUT | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

### Health Check

    GET /api/health

The health endpoint is used to verify that the backend server is running.

---

## 🗄️ Database Design

ProjectPulse uses MongoDB with Mongoose.

The main collections are:

### User

Stores registered user information.

Important fields include:

- name
- email
- password
- createdAt
- updatedAt

Passwords are stored as bcrypt hashes rather than plain text.

### Project

Stores project information.

Important fields include:

- name
- description
- owner
- members
- status
- joinCode
- createdAt
- updatedAt

The owner and members reference User documents.

### Task

Stores project tasks.

Important fields include:

- title
- description
- project
- assignedTo
- status
- priority
- dueDate
- createdBy
- createdAt
- updatedAt

The project and user references allow tasks to be associated with specific projects and team members.

---

## 🔑 Project Join System

Each project receives a unique join code.

Example:

    PULSE-A8K3

A team member can enter this code to join the project.

The flow is:

    Project Owner
          │
          ▼
      Project Created
          │
          ▼
      Unique Join Code
          │
          ▼
      Share Code
          │
          ▼
      Team Member
          │
          ▼
      Enter Join Code
          │
          ▼
      Backend Validates Code
          │
          ▼
      Member Added to Project

This provides a simple way for student teams to collaborate without requiring an administrator to manually create every membership.

---

## 📋 Kanban Task Workflow

Each task has a status.

The available statuses are:

- todo
- in-progress
- done

These statuses are represented visually as:

    ┌──────────────┐
    │     TODO     │
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ IN PROGRESS  │
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │     DONE     │
    └──────────────┘

When a user changes a task's status, the frontend sends an update request to the backend.

    PUT /api/tasks/:id

The backend updates the task document in MongoDB.

The updated task is then displayed in the corresponding Kanban column.

---

## ⚙️ Environment Variables

### Backend

Create a `.env` file inside the `backend` directory.

Required variables:

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    NODE_ENV=development

The production backend also uses:

    FRONTEND_URL=your_frontend_url

The actual secret values should never be committed to GitHub.

---

### Frontend

Create a `.env` file inside the `frontend` directory.

    VITE_API_BASE_URL=your_backend_url

For local development, this can point to the local Express server.

For production, it points to the deployed Render backend.

---

## 🚀 Running the Project Locally

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git

---

### 1. Clone the Repository

    git clone https://github.com/sharvani-karnam/Project-Pulse.git

    cd Project-Pulse

---

### 2. Install Backend Dependencies

    cd backend
    npm install

---

### 3. Configure Backend Environment Variables

Create:

    backend/.env

Add:

    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    NODE_ENV=development

---

### 4. Start the Backend

    npm start

The backend will run on the configured port.

---

### 5. Install Frontend Dependencies

Open another terminal:

    cd frontend
    npm install

---

### 6. Configure Frontend Environment Variables

Create:

    frontend/.env

Add:

    VITE_API_BASE_URL=http://localhost:5000

---

### 7. Start the Frontend

    npm run dev

Vite will provide the local development URL.

---

## 🏭 Production Build

Before deployment, the frontend can be tested with:

    npm run build

This creates the production build inside:

    frontend/dist

The production build was verified successfully during development.

---

## ☁️ Deployment

ProjectPulse is deployed using:

### Frontend

Vercel

    https://project-pulse-three-xi.vercel.app/

### Backend

Render

The Express backend is deployed separately from the frontend.

### Database

MongoDB Atlas

The production backend connects to MongoDB Atlas using the `MONGO_URI` environment variable.

---

## 🔒 Security

ProjectPulse includes several basic security practices:

- Passwords are hashed using bcrypt.
- Authentication uses JWT.
- Protected API routes require authentication.
- Environment variables are used for secrets.
- Sensitive credentials are excluded from Git using `.gitignore`.
- Project operations are associated with authenticated users.
- MongoDB Atlas is used for production database hosting.

---

## 🔁 Complete Data Flow

A typical request flows through the application like this:

    User interacts with React UI
              │
              ▼
       React Component
              │
              ▼
        API Request
              │
              ▼
       Express Route
              │
              ▼
    Authentication Middleware
              │
              ▼
       Route Handler
              │
              ▼
         Mongoose
              │
              ▼
          MongoDB
              │
              ▼
        Backend Response
              │
              ▼
       React Component
              │
              ▼
       Updated UI

For example, when creating a task:

    User fills Task Form
            │
            ▼
    React sends POST request
            │
            ▼
    POST /api/projects/:projectId/tasks
            │
            ▼
    Authentication Middleware
            │
            ▼
    Task Route Handler
            │
            ▼
    Task Model
            │
            ▼
    MongoDB
            │
            ▼
    Task created
            │
            ▼
    JSON response
            │
            ▼
    React updates UI

---

## 🎯 Project Goals

ProjectPulse was developed with the following goals:

- Learn full-stack MERN development
- Understand frontend-backend communication
- Build REST APIs
- Work with MongoDB and Mongoose
- Implement authentication
- Understand JWT-based authorization
- Practice React component architecture
- Implement CRUD operations
- Build a real-world project workflow
- Deploy a full-stack application
- Understand how different parts of a web application work together

---

## 📚 Learning Outcomes

Through this project, the following concepts were practiced:

### Frontend

- React components
- React Router
- Forms and controlled inputs
- API requests
- State management
- Conditional rendering
- Protected routes
- Drag-and-drop interactions

### Backend

- Node.js
- Express.js
- REST API development
- Middleware
- Route handling
- Authentication
- JWT
- Password hashing
- Error handling

### Database

- MongoDB
- MongoDB Atlas
- Mongoose
- Schemas
- Models
- References between collections
- CRUD operations

### Deployment

- Git and GitHub
- Environment variables
- Vercel deployment
- Render deployment
- MongoDB Atlas
- Production configuration

---

## 🔮 Future Improvements

The current version focuses on the core project and task management workflow.

Possible future improvements include:

- Comments on tasks
- Notifications
- Activity feed
- File attachments
- Task labels
- Advanced role-based permissions
- Sprint management
- Milestone tracking
- Project analytics
- Workload tracking
- Search and advanced filtering
- Mentions
- Email notifications
- Real-time collaboration
- Improved mobile experience

These features can be added as the project evolves.

---

## 📌 Current Project Status

ProjectPulse is a functional MERN full-stack application with:

- User authentication
- Project management
- Project joining through unique codes
- Team member management
- Task management
- Kanban workflow
- MongoDB database integration
- REST APIs
- Production deployment

The application is currently deployed and accessible through the live demo.

---

## 👩‍💻 Author

### Sharvani Karnam

B.Tech — Artificial Intelligence & Machine Learning  
Anurag University

### Project

**ProjectPulse — MERN Full-Stack Capstone Project**

---

## 🔗 Links

🌐 Live Application:  
https://project-pulse-three-xi.vercel.app/

💻 GitHub Repository:  
https://github.com/sharvani-karnam/Project-Pulse

---

## ⭐ Project Status

**Deployed and Functional 🚀**
