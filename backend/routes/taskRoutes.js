const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Protect all task routes with JWT authentication middleware
router.use(protect);

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a task inside a project
// @access  Private (Project members only)
router.post('/', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    // Find the project to verify access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the logged-in user is a member of the project
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this project',
      });
    }

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // Validate status if provided
    if (status && !['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Allowed values: todo, in-progress, done',
      });
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        message: 'Invalid priority. Allowed values: low, medium, high',
      });
    }

    // Create the task
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      project: projectId,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Server error creating task' });
  }
});

// @route   GET /api/projects/:projectId/tasks
// @desc    Get all tasks belonging to a specific project
// @access  Private (Project members only)
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify membership
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this project',
      });
    }

    // Fetch tasks for the project
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Get project tasks error:', error);
    return res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private (Project members only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name owner members');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user belongs to the task's project
    const isMember = task.project?.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this project',
      });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error('Get single task error:', error);
    return res.status(500).json({ message: 'Server error fetching task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task details (status, priority, assignment, etc.)
// @access  Private (Project members only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check project membership
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this project',
      });
    }

    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Task title cannot be empty' });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description.trim();
    }

    if (status !== undefined) {
      if (!['todo', 'in-progress', 'done'].includes(status)) {
        return res.status(400).json({
          message: 'Invalid status. Allowed values: todo, in-progress, done',
        });
      }
      task.status = status;
    }

    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({
          message: 'Invalid priority. Allowed values: low, medium, high',
        });
      }
      task.priority = priority;
    }

    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo || null;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error updating task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private (Project members only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check project membership
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this project',
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error deleting task' });
  }
});

module.exports = router;
