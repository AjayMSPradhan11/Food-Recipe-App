const express = require("express");
const router = express.Router();
const db = require("../models/database");
const { correlation } = require('ml-stat/array');
const bcrypt = require("bcrypt");
const saltRounds = 10;

// GET Register Page
router.get("/register", (req, res) => {
  res.render("register", { err: null });
});

// POST Register New User
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, name, preferred_cuisine } = req.body;

    const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.render("register", { err: "Email already in use." });
    }    

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.query(
      "INSERT INTO users (username, email, password, name, preferred_cuisine) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, name, preferred_cuisine]
    );

    console.log(`Registered user: ${username}, ${email}`);

    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error during registration:", error);
    res.render("register", { err: "Registration failed. Please try again." });
  }
});

// GET Login Page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// POST Login User
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    if (user.length === 0) {
      return res.render("login", { error: "Invalid username or password." });
    }

    const match = await bcrypt.compare(password, user[0].password);

    if (!match) {
      return res.render("login", { error: "Invalid username or password." });
    }

    req.session.user = user[0]; 

    console.log(`User logged in: ${username}`);

    res.redirect("/"); 
  } catch (error) {
    console.error("Error during login:", error);
    res.render("login", { error: "Login failed. Please try again." });
  }
});

// GET Logout Page
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.clearCookie("connect.sid"); 
    res.redirect("/auth/login"); 
  });
});

// Function to compute Pearson Correlation 

function computePearsonCorrelation(user1Preferences, user2Preferences) {
  const keys = Object.keys(user1Preferences);

  const sum1 = keys.reduce((sum, key) => sum + user1Preferences[key], 0);
  const sum2 = keys.reduce((sum, key) => sum + user2Preferences[key], 0);

  const sum1Sq = keys.reduce((sum, key) => sum + user1Preferences[key] ** 2, 0);
  const sum2Sq = keys.reduce((sum, key) => sum + user2Preferences[key] ** 2, 0);

  const pSum = keys.reduce((sum, key) => sum + user1Preferences[key] * user2Preferences[key], 0);

  const num = pSum - (sum1 * sum2) / keys.length;
  const den = Math.sqrt(
    (sum1Sq - (sum1 ** 2) / keys.length) * (sum2Sq - (sum2 ** 2) / keys.length)
  );

  return den === 0 ? 0 : num / den;
}


// Function to get recommendations based on user preferences
async function getRecommendations(userId) {
  const user = await db.query("SELECT preferred_cuisine FROM users WHERE id = ?", [userId]);
  if (!user.length) return [];

  const userPreferences = JSON.parse(user[0].preferred_cuisine);

  const allUsers = await db.query("SELECT id, preferred_cuisine FROM users WHERE id != ?", [userId]);

  const similarityScores = allUsers.map(otherUser => {
    const otherPreferences = JSON.parse(otherUser.preferred_cuisine);
    return {
      userId: otherUser.id,
      similarity: computePearsonCorrelation(userPreferences, otherPreferences),
    };
  });

  similarityScores.sort((a, b) => b.similarity - a.similarity);

  if (similarityScores.length === 0) return [];

  const topUser = allUsers.find(u => u.id === similarityScores[0].userId);
  const topUserPreferences = JSON.parse(topUser.preferred_cuisine);

  const userCategory = await db.query(
    "SELECT category_by_region FROM users WHERE id = ?",
    [userId]
  );

  const recommendations = await db.query(
    `SELECT r.id, r.name, r.image_url 
     FROM recipes r 
     JOIN categories c ON r.category_by_region = c.category_by_region 
     WHERE c.category_by_region = ? 
     ORDER BY RAND() 
     LIMIT 5`,
    [userCategory[0].category_by_region]
  );

  return recommendations;
}

module.exports = router;

module.exports.getRecommendations = getRecommendations;
