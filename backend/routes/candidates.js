const express = require("express");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const PIPELINE_ORDER = ["applied", "interviewed", "offered", "active_intern", "completed"];

// CREATE candidate
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, resume_link, applied_date, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const newCandidate = await pool.query(
      `INSERT INTO Candidates (name, email, resume_link, status, applied_date, notes)
       VALUES ($1, $2, $3, 'applied', $4, $5) RETURNING *`,
      [name, email, resume_link || null, applied_date || new Date(), notes || null]
    );

    res.status(201).json(newCandidate.rows[0]);
  } catch (err) {
    console.log("create candidate error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET all candidates
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Candidates ORDER BY applied_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.log("get candidates error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// UPDATE candidate status (with pipeline validation + auto user creation)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!PIPELINE_ORDER.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const current = await pool.query("SELECT * FROM Candidates WHERE id = $1", [req.params.id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidate = current.rows[0];
    const currentIndex = PIPELINE_ORDER.indexOf(candidate.status);
    const newIndex = PIPELINE_ORDER.indexOf(status);

    if (newIndex < currentIndex) {
      console.log(`Warning: backward move from ${candidate.status} to ${status}`);
    }

    const updated = await pool.query(
      "UPDATE Candidates SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    // Agar status "active_intern" ban gaya hai, to user banao (agar pehle se nahi hai)
    if (status === "active_intern") {
      const existingUser = await pool.query("SELECT * FROM Users WHERE email = $1", [candidate.email]);

      if (existingUser.rows.length === 0) {
        const tempPassword = "intern123"; // temporary default password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await pool.query(
          `INSERT INTO Users (name, email, password_hash, role)
           VALUES ($1, $2, $3, 'intern')`,
          [candidate.name, candidate.email, hashedPassword]
        );

        console.log(`New intern user created for ${candidate.email}`);
      } else {
        console.log(`User already exists for ${candidate.email}, skipping creation`);
      }
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.log("update candidate status error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// DELETE candidate
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await pool.query("DELETE FROM Candidates WHERE id = $1 RETURNING *", [req.params.id]);
    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json({ message: "Candidate deleted successfully" });
  } catch (err) {
    console.log("delete candidate error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;