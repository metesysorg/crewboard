const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// SIGNUP route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check karo email pehle se to nahi hai
    const existingUser = await pool.query(
      "SELECT * FROM Users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    // password ko hash (secure) karo
    const hashedPassword = await bcrypt.hash(password, 10);

    // naya user database mein daalo
    const newUser = await pool.query(
      "INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: "Signup successful", user: newUser.rows[0] });

  } catch (err) {
    console.log("signup error:", err);
    res.status(500).json({ message: "Something went wrong during signup" });
  }
});

// LOGIN route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const result = await pool.query(
      "SELECT * FROM Users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.log("login error:", err);
    res.status(500).json({ message: "Something went wrong during login" });
  }
});

// ME route - protected, sirf valid token wale access kar sakte hain
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM Users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });

  } catch (err) {
    console.log("me route error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;