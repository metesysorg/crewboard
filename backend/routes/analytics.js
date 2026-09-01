const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Tasks completed per week
router.get("/tasks-per-week", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('week', created_at) AS week,
        COUNT(*) AS count
      FROM Tasks
      WHERE status = 'done'
      GROUP BY week
      ORDER BY week
    `);
    res.json(result.rows);
  } catch (err) {
    console.log("tasks-per-week error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Average time to hire (approximate: applied_date -> today, for offered+ candidates)
// Note: Candidates table doesn't have a status_updated_at column, so this is an approximation
router.get("/avg-hire-time", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT AVG(EXTRACT(DAY FROM (NOW() - applied_date))) AS avg_days
      FROM Candidates
      WHERE status IN ('offered', 'active_intern', 'completed')
    `);
    const avg = result.rows[0].avg_days;
    res.json({ avg_hire_days: avg ? Number(avg).toFixed(1) : 0 });
  } catch (err) {
    console.log("avg-hire-time error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Workload per user
router.get("/workload", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name,
        COUNT(t.id) FILTER (WHERE t.status != 'done') AS open_task_count
      FROM Users u
      LEFT JOIN Tasks t ON t.assigned_to = u.id
      GROUP BY u.id, u.name
      ORDER BY u.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.log("workload error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;