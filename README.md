# ProjectPulse 🚀

### Collaborative Project & Task Management Platform for Student Teams

ProjectPulse is a full-stack MERN web application designed to help student teams plan, organize, collaborate, and track their college projects from one centralized workspace.

It provides a simple workflow for creating projects, adding teammates, assigning tasks, tracking task progress, and managing work through a Kanban-style board.

---

## 🌐 Live Demo

**ProjectPulse:**  
https://project-pulse-three-xi.vercel.app/

**GitHub Repository:**  
https://github.com/sharvani-karnam/Project-Pulse

---

## 📌 Problem Statement

Student teams often manage college projects using a combination of messaging applications, spreadsheets, notes, and other disconnected tools.

This can make it difficult to:

- Keep track of project tasks
- Know who is responsible for each task
- Monitor project progress
- Coordinate with teammates
- Organize work in one place

ProjectPulse addresses this problem by providing a centralized project workspace where team members can manage their projects and tasks together.

---

## 💡 Solution

ProjectPulse provides a collaborative workspace where users can:

- Create an account and securely log in
- Create and manage projects
- Invite teammates using a project join code
- View project members
- Create and assign tasks
- Set task priorities and due dates
- Track tasks through different workflow stages
- Manage tasks using a Kanban board

The goal is to keep the project workflow simple, organized, and easy to understand for student teams.

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes
- User-specific access to projects

---

## 📁 Project Management

Users can:

- Create projects
- View their projects
- View project details
- Update projects
- Delete projects
- Track project status
- View project members
- Manage project membership

---

## 👥 Team Collaboration

Each project has a unique join code that can be shared with teammates.

### Team workflow

```text
Project Owner
     ↓
Share Join Code
     ↓
Teammate enters Join Code
     ↓
Teammate joins Project
     ↓
Members collaborate on Tasks
