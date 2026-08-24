import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function Candidates() {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    const res = await fetch("http://localhost:5000/api/candidates", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCandidates(Array.isArray(data) ? data : []);
  }

  async function handleAddCandidate(e) {
    e.preventDefault();
    if (!name || !email) {
      setError("Name and email are required");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          email,
          resume_link: resumeLink,
          notes,
        }),
      });
      if (!res.ok) {
        setError("Failed to add candidate");
        return;
      }
      setName("");
      setEmail("");
      setResumeLink("");
      setNotes("");
      setShowForm(false);
      fetchCandidates();
    } catch (err) {
      setError("Something went wrong");
    }
  }

  async function handleStatusChange(candidateId, newStatus) {
    await fetch(`http://localhost:5000/api/candidates/${candidateId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchCandidates();
  }

  const statusOptions = ["applied", "interviewed", "offered", "active_intern", "completed"];

  return (
    <Layout>
      <h2>Candidates</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Add Candidate"}
      </button>

      {showForm && (
        <form
          onSubmit={handleAddCandidate}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Email</label>
            <br />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Resume Link</label>
            <br />
            <input
              value={resumeLink}
              onChange={(e) => setResumeLink(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Notes</label>
            <br />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <button type="submit">Save Candidate</button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Email</th>
            <th style={{ padding: "8px" }}>Resume</th>
            <th style={{ padding: "8px" }}>Applied Date</th>
            <th style={{ padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{c.name}</td>
              <td style={{ padding: "8px" }}>{c.email}</td>
              <td style={{ padding: "8px" }}>
                {c.resume_link ? (
                  <a href={c.resume_link} target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td style={{ padding: "8px" }}>
                {c.applied_date ? new Date(c.applied_date).toLocaleDateString() : "—"}
              </td>
              <td style={{ padding: "8px" }}>
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(c.id, e.target.value)}
                  style={{ padding: "5px" }}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default Candidates;