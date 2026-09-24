import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

function TaskForm({ projectId, members = [], onTaskCreated, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }

    setCreating(true);
    const token = localStorage.getItem('projectpulse_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          assignedTo: formData.assignedTo || null,
          dueDate: formData.dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create task.');
        setCreating(false);
        return;
      }

      // Success
      setCreating(false);
      onTaskCreated(data);
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Network error. Unable to create task.');
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            &times;
          </button>
        </div>

        {error && (
          <div className="auth-alert error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="task-title">Task Title *</label>
            <input
              type="text"
              id="task-title"
              placeholder="e.g. Design Login UI / Connect MongoDB"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={creating}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              rows="3"
              className="form-textarea"
              placeholder="Add details, acceptance criteria, or notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={creating}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={creating}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-assigned">Assign To</label>
              <select
                id="task-assigned"
                className="form-select"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                disabled={creating}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id || member} value={member._id || member}>
                    {member.name || member.email || 'Member'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-duedate">Due Date</label>
            <input
              type="date"
              id="task-duedate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              disabled={creating}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={creating}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
