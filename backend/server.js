const express = require("express");
const cors = require("cors");
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.listen(PORT, () => {
  console.log("server started on port " + PORT);
});