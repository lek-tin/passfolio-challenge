const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const db = require('../config/db');
const users = db.collection('user');

router.get('/', auth.ensureAuthenticated, (req, res, next) => {
  users
    .get()
    .then(querySnapshot => {
      if (querySnapshot) {
        const users = [];
        querySnapshot.docs.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          users.push(doc.data());
        })
        console.log(users);
        res.render('dashboard', {
          users
        });
        return users;
      } else {
        throw new Error("Retrieving users failed")
      }
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
});

module.exports = router;
