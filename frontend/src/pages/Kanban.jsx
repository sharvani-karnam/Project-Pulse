import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import { API_BASE_URL } from '../config/api';

function Kanban() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task Creation Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Fetch Project details and Tasks
  const fetchData = async () => {
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

      if (!projectRes.ok) {
        if (projectRes.status === 403) {
          setError('Access denied. You are not a member of this project.');
        } else if (projectRes.status === 404) {
          setError('Project not found.');
        } else {
          setError('Failed to load project details.');
        }
        setLoading(false);
        return;
      }

      const projectData = await projectRes.json();
      setProject(projectData);

      // 2. Fetch Tasks for this Project
      const tasksRes = await fetch(`${API_BASE_URL}/api/projects/${id}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!tasksRes.ok) {
        setError('Failed to load project tasks.');
        setLoading(false);
        return;
      }

      const tasksData = await tasksRes.json();
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching kanban data:', err);
      setError('Unable to reach backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handle task created
  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Handle task updated (status change or field edit)
  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  // Handle task deleted
  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== deletedTaskId));
  };

  // HTML5 Drag and drop handler for dropping into a column
  const handleDropOnColumn = async (targetStatus, e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const taskToMove = tasks.find((t) => t._id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    const token = localStorage.getItem('projectpulse_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Failed to move task.');
        fetchData(); // Rollback on error
      } else {
        handleTaskUpdated(data);
      }
    } catch (err) {
      console.error('Error moving task:', err);
      fetchData();
    }
  };

  // Filter tasks into columns
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="kanban-container">
        {/* Navigation Breadcrumb */}
        <div className="breadcrumb-bar">
          <Link to={`/projects/${id}`} className="back-link-nav">
            &larr; Back to Project Details
          </Link>
        </div>

        {/* Kanban Header */}
        <div className="kanban-header">
          <div>
            <div className="editorial-badge">
              <span className="badge-dot"></span>
              Kanban Board
            </div>
            <h1 className="page-title">
              {project ? project.name : 'Project Board'}
            </h1>
            <p className="page-subtitle">
              Visual agile workflow for student project deliverables &amp; milestones
            </p>
          </div>

          <div className="kanban-header-actions">
            <button
              onClick={() => setShowTaskModal(true)}
              className="btn-primary-create"
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading Kanban board...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-card">
            <p className="error-title">⚠️ Error</p>
            <p>{error}</p>
            <div className="error-actions">
              <Link to="/projects" className="btn-primary">
                Back to Projects
              </Link>
              <button onClick={fetchData} className="btn-secondary">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Kanban Columns */}
        {!loading && !error && (
          <div className="kanban-board-grid">
            {/* Column 1: TODO */}
            <div
              className="kanban-column col-todo"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnColumn('todo', e)}
            >
              <div className="kanban-column-header">
                <div className="col-title-group">
                  <span className="col-dot todo"></span>
                  <h3 className="col-title">TODO</h3>
                </div>
                <span className="col-count-badge">{todoTasks.length}</span>
              </div>

              <div className="kanban-cards-list">
                {todoTasks.length > 0 ? (
                  todoTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      members={project?.members || []}
                      onTaskUpdated={handleTaskUpdated}
                      onTaskDeleted={handleTaskDeleted}
                      isDraggable={true}
                    />
                  ))
                ) : (
                  <div className="col-empty-card">
                    <p>No tasks in Todo</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: IN PROGRESS */}
            <div
              className="kanban-column col-inprogress"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnColumn('in-progress', e)}
            >
              <div className="kanban-column-header">
                <div className="col-title-group">
                  <span className="col-dot in-progress"></span>
                  <h3 className="col-title">IN PROGRESS</h3>
                </div>
                <span className="col-count-badge">{inProgressTasks.length}</span>
              </div>

              <div className="kanban-cards-list">
                {inProgressTasks.length > 0 ? (
                  inProgressTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      members={project?.members || []}
                      onTaskUpdated={handleTaskUpdated}
                      onTaskDeleted={handleTaskDeleted}
                      isDraggable={true}
                    />
                  ))
                ) : (
                  <div className="col-empty-card">
                    <p>No tasks in progress</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: DONE */}
            <div
              className="kanban-column col-done"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnColumn('done', e)}
            >
              <div className="kanban-column-header">
                <div className="col-title-group">
                  <span className="col-dot done"></span>
                  <h3 className="col-title">DONE</h3>
                </div>
                <span className="col-count-badge">{doneTasks.length}</span>
              </div>

              <div className="kanban-cards-list">
                {doneTasks.length > 0 ? (
                  doneTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      members={project?.members || []}
                      onTaskUpdated={handleTaskUpdated}
                      onTaskDeleted={handleTaskDeleted}
                      isDraggable={true}
                    />
                  ))
                ) : (
                  <div className="col-empty-card">
                    <p>No completed tasks</p>
                  </div>
                )}
              </div>
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

export default Kanban;
