import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function Board() {
  const { id } = useParams();
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProject();
    fetchTasks();
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

  async function handleStatusChange(taskId, newStatus) {
    await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  }

  function isOverdue(task) {
    if (!task.deadline || task.status === "done") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.deadline) < today;
  }

  const columns = [
    { key: "todo", label: "To Do" },
    { key: "doing", label: "Doing" },
    { key: "done", label: "Done" },
  ];

  return (
    <Layout>
      <h2>{project?.name} — Board</h2>

      <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
        {columns.map((col) => (
          <div
            key={col.key}
            style={{
              flex: 1,
              background: "#f5f5f5",
              borderRadius: "8px",
              padding: "12px",
              minHeight: "300px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{col.label}</h3>

            {tasks
              .filter((task) => task.status === col.key)
              .map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <p style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>{task.title}</p>
                  {isOverdue(task) && (
                    <span
                      style={{
                        background: "darkred",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        display: "inline-block",
                        marginBottom: "8px",
                      }}
                    >
                      OVERDUE
                    </span>
                  )}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    style={{ width: "100%", padding: "5px" }}
                  >
                    <option value="todo">To Do</option>
                    <option value="doing">Doing</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Board;