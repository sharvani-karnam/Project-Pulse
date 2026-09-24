const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all project routes
router.use(protect);

// Helper function to generate a unique uppercase join code (e.g. PULSE-X7K9)
const generateJoinCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let isUnique = false;
  let joinCode = '';

  while (!isUnique) {
    let randomStr = '';
    for (let i = 0; i < 4; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    joinCode = `PULSE-${randomStr}`;
    const existing = await Project.findOne({ joinCode });
    if (!existing) {
      isUnique = true;
    }
  }

  return joinCode;
};

// @route   POST /api/projects/join
// @desc    Join an existing project using a unique join code
// @access  Private (Logged-in user)
router.post('/join', async (req, res) => {
  try {
    const { joinCode } = req.body;

    if (!joinCode || !joinCode.trim()) {
      return res.status(400).json({ message: 'Please enter a project join code' });
    }

    const normalizedCode = joinCode.trim().toUpperCase();

    // Find the project matching this join code
    const project = await Project.findOne({ joinCode: normalizedCode });

    if (!project) {
      return res.status(404).json({ message: 'Invalid join code. Project not found' });
    }

    // Check if the user is already a member
    const isMember = project.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: 'You are already a member of this project',
        project,
      });
    }

    // Add user to project members list
    project.members.push(req.user._id);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return res.status(200).json({
      message: 'Successfully joined the project',
      project: populatedProject,
    });
  } catch (error) {
    console.error('Join project error:', error);
    return res.status(500).json({ message: 'Server error joining project' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project (auto-generates unique join code)
// @access  Private (Logged-in user)
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate project name
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Generate unique uppercase join code
    const joinCode = await generateJoinCode();

    // Create project: logged-in user is automatically owner and first member
    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      joinCode,
      owner: req.user._id,
      members: [req.user._id],
      status: 'active',
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ message: 'Server error creating project' });
  }
});

// @route   GET /api/projects
// @desc    Get all projects the logged-in user belongs to
// @access  Private (Logged-in user)
router.get('/', async (req, res) => {
  try {
    // Find only projects where the logged-in user is in the members array
    const projects = await Project.find({ members: req.user._id })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a single project by ID (owner or members only)
// @access  Private (Logged-in member)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const project = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify if the logged-in user is the owner or a member
    const isOwner = project.owner._id.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this project',
      });
    }

    return res.status(200).json(project);
  } catch (error) {
    console.error('Get project by ID error:', error);
    return res.status(500).json({ message: 'Server error fetching project' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project details (owner only)
// @access  Private (Project owner only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only allow the owner to update the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the project owner can update this project',
      });
    }

    const { name, description, status } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: 'Project name cannot be empty' });
      }
      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description.trim();
    }

    if (status !== undefined) {
      if (!['active', 'completed'].includes(status)) {
        return res.status(400).json({
          message: 'Status must be either active or completed',
        });
      }
      project.status = status;
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ message: 'Server error updating project' });
  }
});

// @route   DELETE /api/projects/:id/members/:memberId
// @desc    Remove a member from the project (owner only)
// @access  Private (Project owner only)
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the project owner can remove team members',
      });
    }

    // Cannot remove owner from members
    if (memberId === project.owner.toString()) {
      return res.status(400).json({ message: 'Project owner cannot be removed' });
    }

    // Remove member from members array
    project.members = project.members.filter(
      (m) => m.toString() !== memberId
    );

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return res.status(200).json({
      message: 'Member removed successfully',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ message: 'Server error removing member' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project (owner only)
// @access  Private (Project owner only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only allow the owner to delete the project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the project owner can delete this project',
      });
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ message: 'Server error deleting project' });
  }
});

module.exports = router;
