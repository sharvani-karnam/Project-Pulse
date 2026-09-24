const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
  res.send('ProjectPulse API is running');
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    message: 'ProjectPulse backend is running'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Project management routes
app.use('/api/projects', projectRoutes);

// Task management routes
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});