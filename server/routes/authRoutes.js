const express = require("express");
const router = express.Router();
const db = require("../models/database"); // Import the database pool
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Display register page
router.get("/register", (req, res) => {
  res.render("register", { err: null });
});

// Handle registration form submission
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, name, preferred_cuisine } = req.body;

    // Check if user already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.render("register", { err: "Email already in use." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database
    await db.query(
      "INSERT INTO users (username, email, password, name, preferred_cuisine) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, name, preferred_cuisine]
    );

    console.log(`Registered user: ${username}, ${email}`);

    // Redirect to the login page
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error during registration:", error);
    res.render("register", { err: "Registration failed. Please try again." });
  }
});

// Display login page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Handle login form submission
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists in the database
    const user = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    if (user.length === 0) {
      // If the user doesn't exist, render the login page with an error
      return res.render("login", { error: "Invalid username or password." });
    }

    // Compare the password with the stored hash
    const match = await bcrypt.compare(password, user[0].password);

    if (!match) {
      // If the password doesn't match, render the login page with an error
      return res.render("login", { error: "Invalid username or password." });
    }

    // If login is successful, store user session data
    req.session.user = user[0]; // Store user information in session

    console.log(`User logged in: ${username}`);

    // Redirect to the homepage or another page after login
    res.redirect("/"); // This will render index.ejs (or the homepage route)
  } catch (error) {
    console.error("Error during login:", error);
    res.render("login", { error: "Login failed. Please try again." });
  }
});

module.exports = router;
