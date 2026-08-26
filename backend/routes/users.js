const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role,
        COUNT(t.id) FILTER (WHERE t.status != 'done') AS open_task_count
      FROM Users u
      LEFT JOIN Tasks t ON t.assigned_to = u.id
      GROUP BY u.id, u.name, u.email, u.role
      ORDER BY u.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.log("get users error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;