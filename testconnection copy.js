import pool from "./backend/db.js";

async function testConnection() {
  try {
    const [rows] = await pool.query("SELECT user_id from users;");
    console.log("Database Connected Successfully:", rows);
  } catch (err) {
    console.error("Database Connection Failed:", err);
  }
}

testConnection();
