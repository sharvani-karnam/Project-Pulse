import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

function TaskCard({ task, members = [], onTaskUpdated, onTaskDeleted, isDraggable = false }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    assignedTo: task.assignedTo?._id || task.assignedTo || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Handle direct status change via dropdown
  const handleStatusChange = async (newStatus) => {
    const token = localStorage.getItem('projectpulse_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        onTaskUpdated(data);
      } else {
        alert(data.message || 'Failed to update task status.');
      }
    } catch (err) {
      console.error('Error changing task status:', err);
      alert('Network error updating task status.');
    }
  };

  // Handle full edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!editForm.title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('projectpulse_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          priority: editForm.priority,
          status: editForm.status,
          assignedTo: editForm.assignedTo || null,
          dueDate: editForm.dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update task.');
        setSaving(false);
        return;
      }

      setSaving(false);
      setShowEditModal(false);
      onTaskUpdated(data);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Network error. Unable to update task.');
      setSaving(false);
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;

    setDeleting(true);
    const token = localStorage.getItem('projectpulse_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        onTaskDeleted(task._id);
      } else {
        alert(data.message || 'Failed to delete task.');
        setDeleting(false);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Network error deleting task.');
      setDeleting(false);
    }
  };

  // HTML5 Drag and drop handlers
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <div
        className="task-card"
        draggable={isDraggable}
        onDragStart={handleDragStart}
      >
        {/* Task Header: Priority & Action Buttons */}
        <div className="task-card-top">
          <span className={`priority-badge ${task.priority}`}>
            {task.priority.toUpperCase()}
          </span>

          <div className="task-card-actions">
            <button
              onClick={() => {
                setEditForm({
                  title: task.title,
                  description: task.description || '',
                  priority: task.priority || 'medium',
                  status: task.status || 'todo',
                  assignedTo: task.assignedTo?._id || task.assignedTo || '',
                  dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                });
                setError('');
                setShowEditModal(true);
              }}
              className="task-btn-icon"
              title="Edit Task"
              aria-label="Edit Task"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="task-btn-icon delete"
              title="Delete Task"
              aria-label="Delete Task"
              disabled={deleting}
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Task Title */}
        <h4 className="task-card-title">{task.title}</h4>

        {/* Task Description */}
        {task.description && (
          <p className="task-card-desc">{task.description}</p>
        )}

        {/* Task Footer: Assignee & Due Date */}
        <div className="task-card-meta">
          <div className="task-assignee">
            {task.assignedTo ? (
              <span className="assignee-tag" title={task.assignedTo.email}>
                👤 {task.assignedTo.name || 'Assigned'}
              </span>
            ) : (
              <span className="unassigned-tag">Unassigned</span>
            )}
          </div>

          {task.dueDate && (
            <span className="due-date-tag" title="Due Date">
              📅 {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Quick Status Selector Control */}
        <div className="task-status-control">
          <label htmlFor={`status-${task._id}`} className="status-ctrl-label">
            Status:
          </label>
          <select
            id={`status-${task._id}`}
            className={`status-ctrl-select ${task.status}`}
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close-btn"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="auth-alert error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="edit-task-title">Task Title *</label>
                <input
                  type="text"
                  id="edit-task-title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-task-desc">Description</label>
                <textarea
                  id="edit-task-desc"
                  rows="3"
                  className="form-textarea"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="edit-task-priority">Priority</label>
                  <select
                    id="edit-task-priority"
                    className="form-select"
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm({ ...editForm, priority: e.target.value })
                    }
                    disabled={saving}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-task-status">Status</label>
                  <select
                    id="edit-task-status"
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    disabled={saving}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="edit-task-assigned">Assign To</label>
                  <select
                    id="edit-task-assigned"
                    className="form-select"
                    value={editForm.assignedTo}
                    onChange={(e) =>
                      setEditForm({ ...editForm, assignedTo: e.target.value })
                    }
                    disabled={saving}
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option
                        key={member._id || member}
                        value={member._id || member}
                      >
                        {member.name || member.email || 'Member'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-task-due">Due Date</label>
                  <input
                    type="date"
                    id="edit-task-due"
                    value={editForm.dueDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dueDate: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskCard;
