import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  // abhi ke liye hardcoded numbers hain, baad mein real data se replace karenge
  const stats = [
    { label: "Active Projects", value: 3 },
    { label: "My Open Tasks", value: 5 },
    { label: "Team Size", value: 8 },
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
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              minWidth: "150px",
              textAlign: "center"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "28px" }}>{stat.value}</h3>
            <p style={{ color: "#666", marginTop: "8px" }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Dashboard;