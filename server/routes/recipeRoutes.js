const express = require("express");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");
const db = require("../models/database"); // Import the database pool

const router = express.Router();

// Homepage
router.get("/", async (req, res) => {
  try {
    console.log("");
    // return ({'json':'json'})
    const limitNumber = 5;
    const categories = await Category.findAll(); //SQL ko lai pachi comment hatauney.
    console.log("categories", categories);
    const latest = await Recipe.findAll(); // Fetch latest recipes
    console.log("latest", latest);
    const food = { latest };
    console.log("food", food);

    res.render("index", { title: "Cooking Blog - Home", categories, food });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

// Categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.render("categories", {
      title: "Cooking Blog - Categories",
      categories,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

// Explore Recipes by Category
router.get("/categories/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryById = await Recipe.findAll(); // You can filter by category if needed
    res.render("categories", {
      title: "Cooking Blog - Categories",
      categoryById,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

// Recipe Detail
router.get("/recipe/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render("recipe", {
      title: "Cooking Blog - Recipe",
      recipe: { ...recipe, ingredients: JSON.parse(recipe.ingredients) },
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

// Search Recipes
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
    // console.log("");
    // // return ({'json':'json'})
    // const limitNumber = 5;
    // const categories = await Category.findAll(); //SQL ko lai pachi comment hatauney.
    // console.log("categories", categories);
    // const latest = await Recipe.findAll(); // Fetch latest recipes
    // console.log("latest", latest);
    // const food = { latest };
    // console.log("food", food);

    res.render("submit-recipe", { title: "Cooking Blog - Submit Recipe" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
});

router.post("/submit-recipe", async (req, res) => {
  console.log("chalyo post",req.body);
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No Files were uploaded.");
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath =
        require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }
    await db.query(
      "INSERT INTO recipes (name, description, email, ingredients,category,image) VALUES (?, ?, ?, ?,?,?)",
      [
        req.body.name,
        req.body.description,
        req.body.email,
       JSON.stringify( req.body.ingredients),
        req.body.category,
        newImageName ?? "",
      ]
    );
    // const newRecipe = await Recipe.create({
    //   name: req.body.name,
    //   description: req.body.description,
    //   email: req.body.email,
    //   ingredients: req.body.ingredients,
    //   category: req.body.category,
    //   image: '',
    // });
    // console.log(newRecipe,'added')

    req.flash("infoSubmit", "Recipe has been added.");
    res.redirect("/submit-recipe");
  } catch (error) {
    console.log(error, "error aako");

    req.flash("infoErrors", error.message || "Error Occurred");
    res.redirect("/submit-recipe");
  }
});

module.exports = router;
