import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config/api';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projectsCount: 0,
    activeTasksCount: 0,
    completedTasksCount: 0,
    teamMembersCount: 0,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('projectpulse_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
      }
    }

    const fetchDashboardData = async () => {
      setLoading(true);
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
          throw new Error('Failed to fetch projects');
        }

        const projectList = await response.json();
        setProjects(projectList);

        // Calculate unique team members
        const memberIds = new Set();
        projectList.forEach((p) => {
          if (p.members && Array.isArray(p.members)) {
            p.members.forEach((m) => {
              const mId = m._id || m;
              if (mId) memberIds.add(mId.toString());
            });
          }
        });

        // Fetch tasks for each project to calculate active & completed tasks
        let activeTasks = 0;
        let completedTasks = 0;

        try {
          const taskPromises = projectList.map((p) =>
            fetch(`${API_BASE_URL}/api/projects/${p._id}/tasks`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => (res.ok ? res.json() : []))
              .catch(() => [])
          );

          const allProjectTasks = await Promise.all(taskPromises);
          allProjectTasks.forEach((taskList) => {
            if (Array.isArray(taskList)) {
              taskList.forEach((t) => {
                if (t.status === 'done') {
                  completedTasks += 1;
                } else {
                  activeTasks += 1;
                }
              });
            }
          });
        } catch (taskErr) {
          console.error('Error computing task stats:', taskErr);
        }

        setStats({
          projectsCount: projectList.length,
          activeTasksCount: activeTasks,
          completedTasksCount: completedTasks,
          teamMembersCount: memberIds.size || (projectList.length > 0 ? 1 : 0),
        });
      } catch (err) {
        console.error('Error loading dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const padNumber = (num) => String(num).padStart(2, '0');

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main-container">
        {/* Workspace Overview Header */}
        <section className="dashboard-hero-header">
          <div className="hero-header-left">
            <span className="workspace-overview-label">WORKSPACE OVERVIEW</span>
            <h1 className="hero-greeting-title">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}.
            </h1>
            <p className="hero-greeting-subtitle">
              Here&apos;s what&apos;s happening across your projects and team milestones.
            </p>
          </div>

          <div className="hero-header-actions">
            <Link to="/projects" className="btn-primary-create">
              + New Project
            </Link>
          </div>
        </section>

        {/* 4 Metric Cards with Subtle Top Indicators */}
        <section className="dashboard-stats-grid">
          <div className="stat-card stat-projects">
            <span className="stat-label">PROJECTS</span>
            <div className="stat-value">
              {loading ? '--' : padNumber(stats.projectsCount)}
            </div>
            <span className="stat-meta">Active workspaces</span>
          </div>

          <div className="stat-card stat-tasks">
            <span className="stat-label">ACTIVE TASKS</span>
            <div className="stat-value">
              {loading ? '--' : padNumber(stats.activeTasksCount)}
            </div>
            <span className="stat-meta">Todo &amp; in progress</span>
          </div>

          <div className="stat-card stat-completed">
            <span className="stat-label">COMPLETED</span>
            <div className="stat-value">
              {loading ? '--' : padNumber(stats.completedTasksCount)}
            </div>
            <span className="stat-meta">Finished tasks</span>
          </div>

          <div className="stat-card stat-members">
            <span className="stat-label">TEAM MEMBERS</span>
            <div className="stat-value">
              {loading ? '--' : padNumber(stats.teamMembersCount)}
            </div>
            <span className="stat-meta">Collaborators</span>
          </div>
        </section>

        {/* Recent Projects Section */}
        <section className="dashboard-recent-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Recent Projects</h2>
              <p className="section-subtitle">Your active project spaces and assignments</p>
            </div>
            <Link to="/projects" className="view-all-link">
              View all &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-icon">📁</div>
              <h3>No projects started yet</h3>
              <p>Create a project or join your team with a unique join code to get started.</p>
              <div className="empty-state-actions">
                <Link to="/projects" className="btn-primary-create">
                  + Create Your First Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.slice(0, 4).map((project) => (
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
                      👤 {project.owner?.name || 'Owner'}
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
                      Open Project &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
