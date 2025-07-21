// app.js
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const db = require('./backend/config/db'); // if needed here
require('dotenv').config(); // in case you use JWT_SECRET

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// ✅ Static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'backend/views'));

// ✅ Flash messages middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// ✅ Mount routes
app.use('/', require('./backend/routes/pages'));
app.use('/', require('./backend/routes/auth'));
app.use('/wallet', require('./backend/routes/wallet'));
app.use('/cricket', require('./backend/games/cricket/routes'));
app.use('/aviator', require('./backend/games/aviator/routes'));

module.exports = app;
