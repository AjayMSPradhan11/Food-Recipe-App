const db = require("../models/database"); 
const { computePearsonCorrelation, getRecommendations } = require('../routes/authRoutes');


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

module.exports = { 
  getRecommendations 
};
