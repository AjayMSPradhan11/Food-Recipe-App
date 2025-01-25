const express = require("express");
const router = express.Router();
const db = require("../models/database"); 
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.get("/register", (req, res) => {
  res.render("register", { err: null });
});

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

// Function to compute Pearson Correlation using shared categories
function computePearsonCorrelation(category1, category2) {
  const keys = Object.keys(category1);

  const sum1 = keys.reduce((sum, key) => sum + category1[key], 0);
  const sum2 = keys.reduce((sum, key) => sum + category2[key], 0);

  const sum1Sq = keys.reduce((sum, key) => sum + category1[key] ** 2, 0);
  const sum2Sq = keys.reduce((sum, key) => sum + category2[key] ** 2, 0);

  const pSum = keys.reduce((sum, key) => sum + category1[key] * category2[key], 0);

  const num = pSum - (sum1 * sum2) / keys.length;
  const den = Math.sqrt(
    (sum1Sq - (sum1 ** 2) / keys.length) * (sum2Sq - (sum2 ** 2) / keys.length)
  );

  return den === 0 ? 0 : num / den;
}

router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

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

async function getRecommendations(userPreferences) {
  const allUsers = await db.query("SELECT id, preferred_cuisines FROM users");

  const similarityScores = allUsers.map(user => {
    const userPrefs = JSON.parse(user.preferences); 
    return {
      userId: user.id,
      similarity: computePearsonCorrelation(userPreferences, userPrefs),
    };
  });

  similarityScores.sort((a, b) => b.similarity - a.similarity);

  const topUser = allUsers.find(u => u.id === similarityScores[0].userId);
  const topUserPreferences = JSON.parse(topUser.preferences);

  const recommendations = Object.keys(topUserPreferences)
    .filter(recipe => !userPreferences[recipe] && topUserPreferences[recipe] > 0)
    .map(recipeId => ({
      id: recipeId,
      name: getRecipeNameById(recipeId), 
      image: getRecipeImageById(recipeId),
    }));

  return recommendations;
}

module.exports = router; 

module.exports.getRecommendations = getRecommendations; 