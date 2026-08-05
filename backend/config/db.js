// yeh file database se connection banati hai
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// test karne ke liye - connection ban raha hai ya nahi
pool.connect()
  .then(() => console.log("Database se connection ho gaya"))
  .catch((err) => console.log("Database connection mein masla:", err));

module.exports = pool;