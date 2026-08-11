const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// chhota sa helper - check karo user admin ya pm hai
function isAdminOrPM(req, res, next) {
  if (req.user.role === "admin" || req.user.role === "pm") {
    next();
  } else {
    res.status(403).json({ message: "You are not allowed to do this" });
  }
}

// CREATE project - sirf admin/pm
router.post("/", authMiddleware, isAdminOrPM, async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const newProject = await pool.query(
      "INSERT INTO Projects (name, description, status, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, status || "active", req.user.id]
    );

    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    console.log("create project error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET all projects - sab dekh sakte hain
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await pool.query("SELECT * FROM Projects ORDER BY created_at DESC");
    res.json(projects.rows);
  } catch (err) {
    console.log("get projects error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET one project by id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await pool.query("SELECT * FROM Projects WHERE id = $1", [req.params.id]);

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.rows[0]);
  } catch (err) {
    console.log("get project error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// UPDATE project - sirf admin/pm
router.patch("/:id", authMiddleware, isAdminOrPM, async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const updated = await pool.query(
      "UPDATE Projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status) WHERE id = $4 RETURNING *",
      [name, description, status, req.params.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.log("update project error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// DELETE project - sirf admin/pm
router.delete("/:id", authMiddleware, isAdminOrPM, async (req, res) => {
  try {
    const deleted = await pool.query("DELETE FROM Projects WHERE id = $1 RETURNING *", [req.params.id]);

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.log("delete project error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;