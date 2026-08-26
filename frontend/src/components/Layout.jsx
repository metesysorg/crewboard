import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // check karo user admin ya pm hai ya nahi
  const isAdminOrPM = user?.role === "admin" || user?.role === "pm";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "220px", background: "#1f2937", color: "white", padding: "20px" }}>
        <h3 style={{ marginBottom: "30px" }}>DevOps Hub</h3>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>
          <Link to="/projects" style={{ color: "white" }}>Projects</Link>

          {isAdminOrPM ? (
            <>
              <Link to="/candidates" style={{ color: "white" }}>Candidates</Link>
              <Link to="/team" style={{ color: "white" }}>Team Directory</Link>
              <Link to="/analytics" style={{ color: "white" }}>Analytics</Link>
            </>
          ) : (
            <Link to="/my-tasks" style={{ color: "white" }}>My Tasks</Link>
          )}
        </nav>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 25px",
          borderBottom: "1px solid #ddd"
        }}>
          <span>Welcome, {user?.name} ({user?.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* Page content goes here */}
        <div style={{ padding: "25px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;