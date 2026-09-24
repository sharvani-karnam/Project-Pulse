import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config/api';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Join Project Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('projectpulse_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('projectpulse_token');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to load projects (Status: ${response.status})`);
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Unable to load projects. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!createFormData.name.trim()) {
      setCreateError('Project name is required.');
      return;
    }

    setCreating(true);
    const token = localStorage.getItem('projectpulse_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createFormData.name.trim(),
          description: createFormData.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.message || 'Failed to create project.');
        setCreating(false);
        return;
      }

      // Success: Close modal, reset form, and add new project to list
      setCreateFormData({ name: '', description: '' });
      setShowCreateModal(false);
      setCreating(false);
      setProjects((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Error creating project:', err);
      setCreateError('Network error. Unable to create project.');
      setCreating(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setJoinError('');

    if (!joinCodeInput.trim()) {
      setJoinError('Please enter a valid project join code.');
      return;
    }

    setJoining(true);
    const token = localStorage.getItem('projectpulse_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          joinCode: joinCodeInput.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setJoinError(data.message || 'Failed to join project.');
        setJoining(false);
        return;
      }

      // Success: Close modal, reset input, and add joined project
      setJoining(false);
      setJoinCodeInput('');
      setShowJoinModal(false);

      if (!projects.some((p) => p._id === data.project._id)) {
        setProjects((prev) => [data.project, ...prev]);
      }

      navigate(`/projects/${data.project._id}`);
    } catch (err) {
      console.error('Error joining project:', err);
      setJoinError('Network error. Unable to join project.');
      setJoining(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="projects-container">
        {/* Page Header */}
        <div className="projects-header">
          <div>
            <span className="workspace-overview-label">WORKSPACES</span>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Manage your team projects, capstones, and assignments</p>
          </div>
          <div className="projects-header-actions">
            <button
              onClick={() => {
                setShowJoinModal(true);
                setJoinError('');
                setJoinCodeInput('');
              }}
              className="btn-secondary"
            >
              Join with Code
            </button>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setCreateError('');
              }}
              className="btn-primary-create"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Join Project Modal */}
        {showJoinModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2>Join Project Team</h2>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="modal-close-btn"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              {joinError && (
                <div className="auth-alert error">
                  <span className="alert-icon">⚠️</span>
                  <span>{joinError}</span>
                </div>
              )}

              <form onSubmit={handleJoinSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="joinCode">Team Join Code *</label>
                  <input
                    type="text"
                    id="joinCode"
                    placeholder="e.g. PULSE-X7K9"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    disabled={joining}
                    className="join-code-input"
                    autoFocus
                  />
                  <small className="form-hint">
                    Enter the unique join code provided by your project team owner.
                  </small>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="btn-secondary"
                    disabled={joining}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={joining}>
                    {joining ? 'Joining Team...' : 'Join Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Project Modal / Form */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2>Create New Project</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="modal-close-btn"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              {createError && (
                <div className="auth-alert error">
                  <span className="alert-icon">⚠️</span>
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="name">Project Name *</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="e.g. AI Study Assistant / Web Capstone"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    disabled={creating}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (Optional)</label>
                  <textarea
                    id="description"
                    rows="3"
                    className="form-textarea"
                    placeholder="Briefly describe the project goals, tech stack, or deliverables..."
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                    disabled={creating}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={creating}>
                    {creating ? 'Creating Project...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content States */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading projects...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-card">
            <p className="error-title">⚠️ Error Loading Projects</p>
            <p>{error}</p>
            <button onClick={fetchProjects} className="btn-secondary retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="empty-state-card">
            <div className="empty-icon">📁</div>
            <h3>No projects yet</h3>
            <p>Create a new project workspace or join your team using a unique join code.</p>
            <div className="empty-state-actions">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setCreateError('');
                }}
                className="btn-primary-create"
              >
                + Create Your First Project
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(true);
                  setJoinError('');
                }}
                className="btn-secondary"
              >
                Join with Code
              </button>
            </div>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project._id}
                className="project-card"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="project-card-header">
                  <span className="card-category-tag">PROJECT</span>
                  <span className={`status-tag ${project.status}`}>
                    {project.status === 'active' ? '● Active' : '✓ Completed'}
                  </span>
                </div>

                <h3 className="project-card-title">{project.name}</h3>

                <p className="project-card-desc">
                  {project.description || 'No description provided.'}
                </p>

                <div className="project-card-footer">
                  <span className="card-meta">
                    👤 <strong>{project.owner?.name || 'Owner'}</strong>
                  </span>
                  <span className="card-meta">
                    👥 {project.members?.length || 1} {project.members?.length === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <div className="card-action-bar">
                  {project.joinCode && (
                    <span className="card-code-pill">
                      <code>{project.joinCode}</code>
                    </span>
                  )}
                  <span className="card-open-action">
                    View Project &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Projects;
