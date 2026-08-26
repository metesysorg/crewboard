import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function TeamDirectory() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  return (
    <Layout>
      <h2>Team Directory</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Role</th>
            <th style={{ padding: "8px" }}>Open Tasks</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px" }}>{u.name}</td>
              <td style={{ padding: "8px" }}>{u.role}</td>
              <td
                style={{
                  padding: "8px",
                  fontWeight: Number(u.open_task_count) > 5 ? "bold" : "normal",
                  color: Number(u.open_task_count) > 5 ? "red" : "black",
                }}
              >
                {u.open_task_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default TeamDirectory;