const express = require("express");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const db = require("../models/database");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.findAll(); 
    const latest = await Recipe.findAll(); 

    let recommended = [];
    if (req.session.user) {
      const preferredCuisine = req.session.user.preferred_cuisine;
      recommended = await db.query(
        "SELECT * FROM recipes WHERE category = ? ORDER BY created_at DESC LIMIT ?",
        [preferredCuisine, limitNumber]
      );
    }

    const food = { latest, recommended };
    res.render("index", { title: "Cooking Blog - Home", categories, food });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.render("categories", { title: "Cooking Blog - Categories", categories });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

router.get("/categories/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const recipes = await db.query("SELECT * FROM recipes WHERE category = ?", [category]);
    res.render("categories", { title: `Cooking Blog - ${category} Recipes`, categoryById: recipes });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

router.get("/recipe/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).send("Recipe not found");
    }

    let ingredients = [];
    try {
      ingredients = JSON.parse(recipe.ingredients);
      if (!Array.isArray(ingredients)) {
        ingredients = [];
      }
    } catch (error) {
      ingredients = recipe.ingredients ? recipe.ingredients.split(",") : [];
    }

    res.render("recipe", { title: "Cooking Blog - Recipe", recipe: { ...recipe, ingredients } });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

router.post("/search", async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm;
    const recipes = await Recipe.search(searchTerm);
    res.render("search", { title: "Cooking Blog - Search", recipes });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

router.get("/submit-recipe", async (req, res) => {
  try {
    res.render("submit-recipe", { title: "Cooking Blog - Submit Recipe" });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

router.post("/submit-recipe", async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (req.files && Object.keys(req.files).length > 0) {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;
      uploadPath = require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }

    await db.query(
      "INSERT INTO recipes (name, description, email, ingredients, category, image) VALUES (?, ?, ?, ?, ?, ?)",
      [
        req.body.name,
        req.body.description,
        req.body.email,
        JSON.stringify(req.body.ingredients),
        req.body.category,
        newImageName ?? "",
      ]
    );

    req.flash("infoSubmit", "Recipe has been added.");
    res.redirect("/submit-recipe");
  } catch (error) {
    req.flash("infoErrors", error.message || "Error Occurred");
    res.redirect("/submit-recipe");
  }
});

module.exports = router;

