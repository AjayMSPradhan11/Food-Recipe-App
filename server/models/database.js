const mysql = require('mysql');
const util = require('util'); // To promisify methods

// Create a MySQL pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your MySQL password
  database: 'recifree',      // Replace with your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: 3306 
});

// Promisify the pool.query method
pool.query = util.promisify(pool.query);

// Export the pool
module.exports = pool;