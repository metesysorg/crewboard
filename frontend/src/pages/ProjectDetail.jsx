import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function ProjectDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchUsers();
  }, [id]);

  async function fetchProject() {
    const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProject(data);
  }

  async function fetchTasks() {
    const res = await fetch(`http://localhost:5000/api/tasks?project_id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(data);
  }

  async function fetchUsers() {
    const res = await fetch("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!title) {
      setError("Task title is required");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          project_id: id,
          title,
          description,
          assigned_to: assignedTo || null,
          priority,
          deadline: deadline || null,
        }),
      });
      if (!res.ok) {
        setError("Failed to create task");
        return;
      }
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setPriority("medium");
      setDeadline("");
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError("Something went wrong");
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm("Delete this task?")) return;
    await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  }

  function getUserName(userId) {
    const u = users.find((u) => u.id === userId);
    return u ? u.name : "Unassigned";
  }

  function isOverdue(task) {
    if (!task.deadline || task.status === "done") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.deadline) < today;
  }

  return (
    <Layout>
      <h2>{project?.name}</h2>
      <p>{project?.description}</p>
      <Link to={`/projects/${id}/board`}>
        <button style={{ marginBottom: "15px" }}>View Board</button>
      </Link>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Create Task"}
      </button>

      {showForm && (
        <form
          onSubmit={handleCreateTask}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "15px",
            maxWidth: "400px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <label>Title</label>
            <br />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Description</label>
            <br />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Assign To</label>
            <br />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Priority</label>
            <br />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Deadline</label>
            <br />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <button type="submit">Save Task</button>
        </form>
      )}

      <div style={{ marginTop: "20px" }}>
        {tasks.length === 0 ? (
          <p>No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4 style={{ margin: 0 }}>{task.title}</h4>
                <div>
                  {task.priority === "high" && (
                    <span
                      style={{
                        background: "red",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      HIGH
                    </span>
                  )}
                  {isOverdue(task) && (
                    <span
                      style={{
                        background: "darkred",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        marginLeft: "6px",
                      }}
                    >
                      OVERDUE
                    </span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#666" }}>{task.description}</p>
              <p style={{ fontSize: "13px" }}>
                Assigned to: <strong>{getUserName(task.assigned_to)}</strong>
              </p>
              <p style={{ fontSize: "13px" }}>
                Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
              </p>
              <p style={{ fontSize: "13px" }}>
                Status: <strong>{task.status}</strong>
              </p>
              <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default ProjectDetail;