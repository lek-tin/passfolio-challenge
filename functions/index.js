const functions = require('firebase-functions');
const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Passport Config
require('./config/passport')(passport);
// Connect flash
app.use(flash());
// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
// controllers
const dashboardRouter = require('./routes/dashboard');
const userRouter = require('./routes/user');
app.use('/dashboard', dashboardRouter);
app.use('/user', userRouter);
// Pass app to Firebase
exports.app = functions.https.onRequest(app);
