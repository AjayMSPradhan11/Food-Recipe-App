const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const routes = require('./server/routes/recipeRoutes'); // Import routes
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(expressLayouts);

// Cookie parser and session management
app.use(cookieParser(process.env.COOKIE_SECRET || 'defaultCookieSecret'));
app.use(session({
  secret: process.env.SECRET || 'defaultSessionSecret',
  saveUninitialized: true,
  resave: true
}));

// Flash messages
app.use(flash());

// File upload
app.use(fileUpload());

// EJS settings
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// Routes
app.use('/', routes);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'An unexpected error occurred.' });
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
