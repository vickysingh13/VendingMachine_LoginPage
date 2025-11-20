import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import pool from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// Register new user
app.post("/api/register", async (req, res) => {
  const { user_id, password } = req.body;
  console.log("Register request:", req.body);

  if (!user_id || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user exists
    const [existing] = await pool.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
    if (existing.length > 0) {
      console.log(" User already exists");
      return res.status(400).json({ message: "User ID already exists" });
    }

    // Hash password and store
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (user_id, password) VALUES (?, ?)", [user_id, hashedPassword]);

    console.log("User registered successfully");
    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error(" Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//  Login existing user
app.post("/api/login", async (req, res) => {
  const { user_id, password } = req.body;
  console.log("Login request:", req.body);

  if (!user_id || !password) {
    console.log("Missing credentials");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
    console.log("DB result:", rows);

    if (rows.length === 0) {
      console.log("User not found:", user_id);
      return res.status(400).json({ message: "Invalid ID or Password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (isMatch) {
      console.log(" Login successful for", user_id);
      res.json({ message: "Login successful" });
    } else {
      console.log(" Wrong password for", user_id);
      res.status(400).json({ message: "Invalid ID or Password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running at http://localhost:5000"));
