const db = require('../models');
const Category = db.Category;
const Recipe = db.Recipe;

/**
 * GET /
 * Homepage 
 */
exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.findAll({ limit: limitNumber });
    const latest = await Recipe.findAll({ order: [['id', 'DESC']], limit: limitNumber });
    const thai = await Recipe.findAll({ where: { category: 'Thai' }, limit: limitNumber });
    const american = await Recipe.findAll({ where: { category: 'American' }, limit: limitNumber });
    const chinese = await Recipe.findAll({ where: { category: 'Chinese' }, limit: limitNumber });

    const food = { latest, thai, american, chinese };

    res.render('index', { title: 'Cooking Blog - Home', categories, food });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
};

/**
 * GET /categories
 * Categories 
 */
exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 20;
    const categories = await Category.findAll({ limit: limitNumber });
    res.render('categories', { title: 'Cooking Blog - Categories', categories });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
};

/**
 * GET /categories/:id
 * Categories By Id
 */
exports.exploreCategoriesById = async (req, res) => {
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.findAll({ where: { category: categoryId }, limit: limitNumber });
    res.render('categories', { title: 'Cooking Blog - Categories', categoryById });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
};

/**
 * POST /submit-recipe
 * Submit Recipe
 */
exports.submitRecipeOnPost = async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('No Files were uploaded.');
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }

    const newRecipe = await Recipe.create({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName,
    });

    req.flash('infoSubmit', 'Recipe has been added.');
    res.redirect('/submit-recipe');
  } catch (error) {
    req.flash('infoErrors', error.message || "Error Occurred");
    res.redirect('/submit-recipe');
  }
};
