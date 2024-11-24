const db = require('./database');  // Import the MySQL pool with promisified query method

class Category {
  constructor(name, image) {
    this.name = name;
    this.image = image;
  }

  // Save a new category to the database
  async save() {
    const result = await db.query(
      'INSERT INTO categories (name, image) VALUES (?, ?)', 
      [this.name, this.image]
    );
    return result;
  }

  // Fetch all categories from the database
  static async findAll() {
    const rows = await db.query('SELECT * FROM categories');
    return rows;
  }

  // Fetch a category by its ID
  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];  // Return the first result (there should only be one)
  }

  // Update a category
  static async update(id, name, image) {
    const result = await db.query(
      'UPDATE categories SET name = ?, image = ? WHERE id = ?',
      [name, image, id]
    );
    return result;
  }

  // Delete a category by its ID
  static async delete(id) {
    const result = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result;
  }
}

module.exports = Category;
