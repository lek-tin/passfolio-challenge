const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const auth = require('../config/auth');
const db = require('../config/db');
const userCollection = db.collection('user');

// Login Page
router.get('/login', auth.forwardAuthenticated, (req, res, next) => {
  res.render('login');
});
// Signup page
router.get('/signup', auth.forwardAuthenticated, (req, res, next) => {
  res.render('signup');
});

// Sign up
router.post('/signup', (req, res) => {
  // req.setTimeout(50000);
  const { first_name, last_name, email, password } = req.body;
  let errors = [];
  if (!first_name || !last_name || !email || !password) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('signup', {
      errors,
      first_name,
      last_name,
      email,
      password,
    });
  } else {
    userCollection
      .get()
      .then(querySnapshot => {
        if (querySnapshot) {
          const users = [];
          let authUser = {};
          querySnapshot.docs.forEach(doc => {
            users.push(doc.data());
          })
          // Match user
          authUser = users.find(user => {
            return user.email === email;
          });
          console.log('authUser')
          console.log(authUser)
          if (authUser) {
            errors.push({ msg: 'Email already exists' });
            res.render('login');
          } else {
            let newUser = {
              first_name,
              last_name,
              email,
              password,
              firestore_balance: 100,
              database_balance: 100
            };

            bcrypt.genSalt(10, (err, salt) => {
              if (err) throw err;
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                userCollection
                  .add(newUser)
                  .then(user => {
                    console.log('Added user with ID: ', user.id);
                  })
                  .then(user => {
                    req.flash(
                      'success_msg',
                      'You are now registered and can log in'
                    );
                    res.redirect('/user/login');
                  })
                  .catch(err => console.log(err));
              });
            });
          }
          return authUser;
        } else {
          throw new Error("Retrieving users failed")
        }
      })
      .catch(err => {
        console.log('Error getting documents', err);
      });

  }
});
// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/user/login');
});
module.exports = router;
