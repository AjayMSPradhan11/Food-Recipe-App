const express = require("express");
const router = express.Router();
const db = require("../models/database"); // Import the database pool

// Display register page
router.get("/register", (req, res) => {
  res.render("register", { err: null });
});

// Handle registration form submission
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.render("register", { err: "Email already in use." });
    }

    // Insert new user into the database
    await db.query(
      "INSERT INTO users (username, email, password, name) VALUES (?, ?, ?, ?)",
      [username, email, password, name]
    );

    console.log(`Registered user: ${username}, ${email}`);
    res.redirect("/login"); // Redirect to login page after successful registration
  } catch (error) {
    console.error("Error during registration:", error);
    res.render("register", { err: "Registration failed. Please try again." });
  }
});

module.exports = router;
