const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
