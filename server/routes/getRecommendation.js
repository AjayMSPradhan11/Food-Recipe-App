const db = require("../models/database"); // Import the database pool
const { computePearsonCorrelation, getRecommendations } = require('../routes/authRoutes');


// Get recommendations based on user preferences and categories
async function getRecommendations(userPreferences) {
  // Fetch all users' preferences from the database
  const allUsers = await db.query("SELECT id, preferred_cuisines FROM users");

  const similarityScores = allUsers.map(user => {
    const userPrefs = JSON.parse(user.preferences); // Assume preferences are stored as JSON
    return {
      userId: user.id,
      similarity: computePearsonCorrelation(userPreferences, userPrefs),
    };
  });

  // Sort users by similarity in descending order
  similarityScores.sort((a, b) => b.similarity - a.similarity);

  // Get the preferences of the most similar user
  const topUser = allUsers.find(u => u.id === similarityScores[0].userId);
  const topUserPreferences = JSON.parse(topUser.preferences);

  // Recommend recipes that the top user likes but the current user has not rated
  const recommendations = Object.keys(topUserPreferences)
    .filter(recipe => !userPreferences[recipe] && topUserPreferences[recipe] > 0)
    .map(recipeId => ({
      id: recipeId,
      name: getRecipeNameById(recipeId), // Fetch recipe details
      image: getRecipeImageById(recipeId),
    }));

  return recommendations;
}

module.exports = { 
  getRecommendations 
};
