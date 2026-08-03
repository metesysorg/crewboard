import { useEffect, useState } from "react";

function App() {
  
  const [backendStatus, setBackendStatus] = useState("loading...");

  useEffect(() => {
    
    fetch("http://localhost:5000/api/health")
      .then((res) => res.json())
      .then((data) => {
        console.log("backend se mila:", data);
        setBackendStatus(data.status);
      })
      .catch((err) => {
        console.log("kuch masla ho gaya:", err);
        setBackendStatus("error");
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>DevOps Hub</h1>
      <p>Backend status: {backendStatus}</p>
    </div>
  );
}

export default App;