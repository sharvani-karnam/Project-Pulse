# ProjectPulse 🚀

ProjectPulse is a full-stack MERN (MongoDB, Express, React, Node.js) collaborative project and task management web application designed for teams and students.

---

## 🌟 Key Features

- **Authentication & Security**: Secure user registration, login, and JWT-based authentication.
- **Projects Management**: Create, view, manage, and delete projects.
- **Team Collaboration**: Simple join-code system allowing team members to join projects with unique codes.
- **Task Management & Kanban Board**: Full CRUD for tasks with interactive drag-and-drop / column-based status workflows (`Todo`, `In Progress`, `Done`).
- **Modern UI**: Clean, responsive, and distraction-free interface built with React and Vite.

---

## 📁 Project Structure

```text
Project Pulse/
├── backend/
│   ├── config/            # Database connection setup (MongoDB / Mongoose)
│   ├── middleware/        # JWT Authentication middleware
│   ├── models/            # Mongoose Schemas (User, Project, Task)
│   ├── routes/            # Express API Route Handlers
│   ├── .env.example       # Backend environment variable template
│   ├── package.json       # Backend dependencies and scripts
│   └── server.js          # Express app entrypoint
├── frontend/
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Visual assets
│   │   ├── components/    # Reusable React components (Navbar, TaskCard, TaskForm, etc.)
│   │   ├── config/        # API configuration (Centralized API_BASE_URL)
│   │   ├── pages/         # Application pages (Landing, Login, Register, Dashboard, Projects, Kanban)
│   │   ├── App.jsx        # Route definitions
│   │   └── main.jsx       # App bootstrap
│   ├── .env.example       # Frontend environment variable template
│   ├── package.json       # Frontend dependencies and scripts
│   ├── vercel.json        # SPA client-side routing rewrites for Vercel
│   └── vite.config.js     # Vite build configuration
├── .gitignore             # Root gitignore protecting environment secrets and build artifacts
└── README.md
```

---

## 💻 Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env based on .env.example
# Add your MONGO_URI, JWT_SECRET, and PORT (5000)
npm run dev   # or npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Create .env based on .env.example (or default to http://localhost:5000)
npm run dev
```

---

## 🚀 Deployment

- **Backend**: Deployed as a Web Service on **Render** (Node.js runtime).
- **Frontend**: Deployed on **Vercel** with SPA rewrites (`vercel.json`).
- **Database**: Hosted on **MongoDB Atlas**.
