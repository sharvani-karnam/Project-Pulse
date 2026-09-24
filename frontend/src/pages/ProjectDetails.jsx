import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { API_BASE_URL } from '../config/api';

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState('');

  // Copy Code Feedback State
  const [copied, setCopied] = useState(false);

  // Edit Project Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Project State
  const [deleting, setDeleting] = useState(false);

  // New Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Current logged in user from localStorage
  const storedUser = localStorage.getItem('projectpulse_user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Fetch Project Details & Tasks
  const fetchProjectAndTasks = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('projectpulse_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // 1. Fetch Project Details
      const projectRes = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const projectData = await projectRes.json();

      if (!projectRes.ok) {
        if (projectRes.status === 404) {
          setError('Project not found. It may have been deleted.');
        } else if (projectRes.status === 403) {
          setError(projectData.message || 'Access denied. You are not a member of this project.');
        } else {
          setError(projectData.message || 'Error loading project details.');
        }
        setLoading(false);
        return;
      }

      setProject(projectData);
      setEditForm({
        name: projectData.name || '',
        description: projectData.description || '',
        status: projectData.status || 'active',
      });
      setLoading(false);

      // 2. Fetch Tasks
      setTasksLoading(true);
      const tasksRes = await fetch(`${API_BASE_URL}/api/projects/${id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
      setTasksLoading(false);
    } catch (err) {
      console.error('Error fetching project details/tasks:', err);
      setError('Unable to reach the server. Make sure the backend server is running.');
      setLoading(false);
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const handleCopyCode = async () => {
    if (!project?.joinCode) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(project.joinCode);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = project.joinCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy join code:', err);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    const confirmRemove = window.confirm(`Remove ${memberName || 'this member'} from the project?`);
    if (!confirmRemove) return;

    const token = localStorage.getItem('projectpulse_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setProject(data.project);
      } else {
        alert(data.message || 'Failed to remove member.');
      }
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Network error. Unable to remove member.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editForm.name.trim()) {
      setEditError('Project name cannot be empty.');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('projectpulse_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          status: editForm.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setEditError('Only the project owner can edit this project.');
        } else {
          setEditError(data.message || 'Failed to update project.');
        }
        setSaving(false);
        return;
      }

      setProject(data);
      setShowEditModal(false);
      setSaving(false);
    } catch (err) {
      console.error('Error updating project:', err);
      setEditError('Network error. Unable to update project.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this project?');
    if (!confirmDelete) return;

    setDeleting(true);
    const token = localStorage.getItem('projectpulse_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          alert('Only the project owner can delete this project.');
        } else {
          alert(data.message || 'Failed to delete project.');
        }
        setDeleting(false);
        return;
      }

      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Network error. Unable to delete project.');
      setDeleting(false);
    }
  };

  // Task event handlers
  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== deletedTaskId));
  };

  const isOwner =
    project && currentUser && (project.owner?._id === currentUser._id || project.owner === currentUser._id);

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="projects-container">
        {/* Navigation Breadcrumb */}
        <div className="breadcrumb-bar">
          <Link to="/projects" className="back-link-nav">
            &larr; Back to Projects
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading project workspace...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-card">
            <p className="error-title">⚠️ Access or Loading Issue</p>
            <p>{error}</p>
            <div className="error-actions">
              <Link to="/projects" className="btn-primary">
                Return to Projects List
              </Link>
              <button onClick={fetchProjectAndTasks} className="btn-secondary">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Project Details View */}
        {project && !loading && !error && (
          <div className="project-details-container">
            {/* Top Header */}
            <div className="details-header">
              <div className="details-title-area">
                <div className="details-meta-pill">
                  <span className="role-context-badge">
                    {project.status === 'active' ? 'ACTIVE' : 'COMPLETED'} · {isOwner ? 'OWNER' : 'MEMBER'}
                  </span>
                </div>
                <h1 className="details-title">{project.name}</h1>
                <p className="details-description">
                  {project.description || 'No description provided for this project.'}
                </p>
              </div>

              <div className="details-actions">
                <Link to={`/projects/${id}/kanban`} className="btn-primary">
                  Open Kanban
                </Link>
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setEditForm({
                          name: project.name,
                          description: project.description || '',
                          status: project.status || 'active',
                        });
                        setEditError('');
                        setShowEditModal(true);
                      }}
                      className="btn-secondary"
                      disabled={deleting}
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="btn-delete"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Clean Monochrome Metadata Row */}
            <div className="details-timeline-row">
              <div className="timeline-item">
                <span className="meta-lbl">Created:</span>
                <span className="meta-val">
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recent'}
                </span>
              </div>
              <div className="timeline-item">
                <span className="meta-lbl">Total Tasks:</span>
                <span className="meta-val">{tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}</span>
              </div>
              <div className="timeline-item">
                <span className="meta-lbl">Team Size:</span>
                <span className="meta-val">{project.members?.length || 1} {project.members?.length === 1 ? 'Member' : 'Members'}</span>
              </div>
            </div>

            {/* TEAM & JOIN CODE SECTION */}
            <div className="team-section-block">
              <div className="team-grid-layout">
                {/* Light Grey Join Code Card */}
                <div className="join-code-card">
                  <span className="join-card-title">PROJECT JOIN CODE</span>

                  <div className="join-card-body">
                    <span className="join-code-display">
                      {project.joinCode || 'N/A'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="btn-primary btn-copy-code"
                      title="Click to copy join code"
                    >
                      {copied ? '✓ Copied!' : 'Copy Code'}
                    </button>
                  </div>

                  <p className="join-card-instruction">
                    Share this code with your teammates to let them join this project.
                  </p>
                </div>

                {/* Light Grey Team Members Card */}
                <div className="team-members-card">
                  <div className="team-members-header">
                    <h3 className="team-card-title">
                      TEAM MEMBERS ({project.members?.length || 0})
                    </h3>
                    <span className="owner-chip">
                      Owner: <strong>{project.owner?.name || 'Owner'}</strong>
                    </span>
                  </div>

                  <div className="members-list-scroll">
                    {project.members && project.members.length > 0 ? (
                      project.members.map((member) => {
                        const isMemberOwner =
                          member._id === project.owner?._id || member._id === project.owner;
                        return (
                          <div key={member._id || member} className="member-item-row">
                            <div className="member-item">
                              <div className="member-avatar">
                                {(member.name || 'M').charAt(0).toUpperCase()}
                              </div>
                              <div className="member-info">
                                <span className="member-name">
                                  {member.name || 'Member'}
                                </span>
                                <span className="member-role-sub">
                                  {isMemberOwner ? 'Owner' : 'Member'}
                                </span>
                              </div>
                            </div>

                            {/* Owner can remove other members */}
                            {isOwner && !isMemberOwner && (
                              <button
                                onClick={() => handleRemoveMember(member._id, member.name)}
                                className="btn-delete-sm"
                                title="Remove member from project"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="empty-subtext">No members yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="project-tasks-section">
              <div className="tasks-section-header">
                <div>
                  <h2 className="tasks-section-title">
                    PROJECT TASKS ({tasks.length})
                  </h2>
                  <p className="tasks-section-subtitle">
                    Manage deliverables, assignments, and milestones
                  </p>
                </div>
                <div className="tasks-header-actions">
                  <Link to={`/projects/${id}/kanban`} className="btn-secondary">
                    Kanban View &rarr;
                  </Link>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="btn-primary"
                  >
                    + New Task
                  </button>
                </div>
              </div>

              {tasksLoading && (
                <div className="loading-state-inline">
                  <div className="loading-spinner"></div>
                  <p>Loading tasks...</p>
                </div>
              )}

              {!tasksLoading && tasks.length === 0 && (
                <div className="empty-tasks-box">
                  <div className="empty-icon">📝</div>
                  <h3>No tasks in this workspace</h3>
                  <p>Break your project into tasks and track progress together.</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="btn-primary"
                  >
                    + Create First Task
                  </button>
                </div>
              )}

              {!tasksLoading && tasks.length > 0 && (
                <div className="tasks-list-container">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      members={project.members || []}
                      onTaskUpdated={handleTaskUpdated}
                      onTaskDeleted={handleTaskDeleted}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2>Edit Project Details</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="modal-close-btn"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              {editError && (
                <div className="auth-alert error">
                  <span className="alert-icon">⚠️</span>
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="edit-name">Project Name *</label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-desc">Description</label>
                  <textarea
                    id="edit-desc"
                    rows="3"
                    className="form-textarea"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    disabled={saving}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
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
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        {showTaskModal && (
          <TaskForm
            projectId={id}
            members={project?.members || []}
            onTaskCreated={handleTaskCreated}
            onClose={() => setShowTaskModal(false)}
          />
        )}
      </main>
    </div>
  );
}

export default ProjectDetails;
