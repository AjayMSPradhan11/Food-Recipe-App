const db = require('./database');  // Assuming you have set up the database connection

class Recipe {
  constructor(name, description, email, ingredients, category, image) {
    this.name = name;
    this.description = description;
    this.email = email;
    this.ingredients = ingredients;  // This will be an array, so we store it as a JSON string in MySQL
    this.category = category;
    this.image = image;
  }

  // Save a new recipe to the database
  async save() {
    const [result] = await db.query(
      'INSERT INTO recipes (name, description, email, ingredients, category, image) VALUES (?, ?, ?, ?, ?, ?)',
      [this.name, this.description, this.email, JSON.stringify(this.ingredients), this.category, this.image]
    );
    return result;
  }

  // Fetch all recipes
  static async findAll() {
    const rows = await db.query('SELECT * FROM recipes');
    return rows;
  }

  // Fetch recipe by ID
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM recipes WHERE id = ?', [id]);
    return rows;  // Return the first result (it should only be one)
  }

  // Search recipes by name or description
  static async search(searchTerm) {
    const [rows] = await db.query(
      'SELECT * FROM recipes WHERE MATCH(name, description) AGAINST(?)',
      [searchTerm]
    );
    return rows;
  }
}

module.exports = Recipe;

