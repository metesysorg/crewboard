import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, token } = useAuth();
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    fetchOverdueCount();
  }, []);

  async function fetchOverdueCount() {
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const tasks = Array.isArray(data) ? data : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = tasks.filter((task) => {
        if (!task.deadline || task.status === "done") return false;
        return new Date(task.deadline) < today;
      });

      setOverdueCount(overdue.length);
    } catch (err) {
      console.log("fetch overdue count error:", err);
    }
  }

  // Active Projects aur Team Size abhi hardcoded hain, baad ki weeks mein real data se wire karenge
  const stats = [
    { label: "Active Projects", value: 3 },
    { label: "My Open Tasks", value: 5 },
    { label: "Team Size", value: 8 },
    { label: "Overdue Tasks", value: overdueCount, isOverdue: true },
  ];

  return (
    <Layout>
      <h2>Dashboard</h2>
      <p>Welcome back, {user?.name}!</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              border: stat.isOverdue && stat.value > 0 ? "1px solid darkred" : "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              minWidth: "150px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "28px",
                color: stat.isOverdue && stat.value > 0 ? "darkred" : "black",
              }}
            >
              {stat.value}
            </h3>
            <p style={{ color: "#666", marginTop: "8px" }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Dashboard;