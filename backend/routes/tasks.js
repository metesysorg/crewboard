const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { project_id, title, description, assigned_to, priority, deadline } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({ message: "Title and project_id are required" });
    }

    // check karo project waqai maujood hai
    const projectCheck = await pool.query("SELECT * FROM Projects WHERE id = $1", [project_id]);
    if (projectCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid project_id - project does not exist" });
    }

    // agar assigned_to diya gaya hai, check karo wo user maujood hai
    if (assigned_to) {
      const userCheck = await pool.query("SELECT * FROM Users WHERE id = $1", [assigned_to]);
      if (userCheck.rows.length === 0) {
        return res.status(400).json({ message: "Invalid assigned_to - user does not exist" });
      }
    }

    const newTask = await pool.query(
      `INSERT INTO Tasks (project_id, title, description, assigned_to, status, priority, deadline)
       VALUES ($1, $2, $3, $4, 'todo', $5, $6) RETURNING *`,
      [project_id, title, description, assigned_to || null, priority || "medium", deadline || null]
    );

    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.log("create task error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET tasks - optionally filter by project_id (?project_id=1)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { project_id } = req.query;

    let result;
    if (project_id) {
      result = await pool.query("SELECT * FROM Tasks WHERE project_id = $1 ORDER BY created_at DESC", [project_id]);
    } else {
      result = await pool.query("SELECT * FROM Tasks ORDER BY created_at DESC");
    }

    res.json(result.rows);
  } catch (err) {
    console.log("get tasks error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// UPDATE task (general fields)
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, assigned_to, status, priority, deadline } = req.body;

    const updated = await pool.query(
      `UPDATE Tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        assigned_to = COALESCE($3, assigned_to),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        deadline = COALESCE($6, deadline)
       WHERE id = $7 RETURNING *`,
      [title, description, assigned_to, status, priority, deadline, req.params.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.log("update task error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// UPDATE task status only (for the board view - Day 5 mein use hoga)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["todo", "doing", "done"].includes(status)) {
      return res.status(400).json({ message: "Status must be todo, doing, or done" });
    }

    const updated = await pool.query(
      "UPDATE Tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.log("update task status error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// DELETE task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await pool.query("DELETE FROM Tasks WHERE id = $1 RETURNING *", [req.params.id]);

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.log("delete task error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;