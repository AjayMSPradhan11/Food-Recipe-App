const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const recipeRoutes = require('./server/routes/recipeRoutes');
const authRoutes = require('./server/routes/authRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(expressLayouts);

app.use(cookieParser(process.env.COOKIE_SECRET || 'defaultCookieSecret'));
app.use(session({
  secret: process.env.SECRET || 'defaultSessionSecret',
  saveUninitialized: true,
  resave: true,
}));

app.use(flash());
app.use(fileUpload());

app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use('/', recipeRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  const userLoggedIn = req.session.user ? true : false;
  res.render('home', { userLoggedIn });
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'An unexpected error occurred.' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});