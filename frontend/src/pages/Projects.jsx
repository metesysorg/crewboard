import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const isAdminOrPM = user?.role === "admin" || user?.role === "pm";

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    if (!name) {
      setError("Project name is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, status }),
      });

      if (!res.ok) {
        setError("Failed to create project");
        return;
      }

      setName("");
      setDescription("");
      setStatus("active");
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError("Something went wrong");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
    } catch (err) {
      setError("Failed to delete project");
    }
  }

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Projects</h2>
        {isAdminOrPM && (
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Create Project"}
          </button>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {showForm && isAdminOrPM && (
        <form
          onSubmit={handleCreate}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            marginTop: "15px",
            maxWidth: "400px",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <label>Name</label>
            <br />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <label>Status</label>
            <br />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button type="submit">Save Project</button>
        </form>
      )}

      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects yet — create your first one</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  width: "250px",
                }}
              >
                <Link to={`/projects/${project.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 style={{ margin: "0 0 8px 0" }}>{project.name}</h3>
                </Link>
                <p style={{ color: "#666", fontSize: "14px" }}>{project.description || "No description"}</p>
                <p style={{ fontSize: "13px" }}>
                  Status: <strong>{project.status}</strong>
                </p>
                {isAdminOrPM && (
                  <button onClick={() => handleDelete(project.id)} style={{ marginTop: "8px" }}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Projects;