const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role FROM Users");
    res.json(result.rows);
  } catch (err) {
    console.log("get users error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;