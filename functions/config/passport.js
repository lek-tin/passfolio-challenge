const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./db');
const userCollection = db.collection('user');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      userCollection
        .get()
        .then(querySnapshot => {
          if (querySnapshot) {
            const users = [];
            let authUser = {};
            querySnapshot.docs.forEach(doc => {
              // console.log(doc.id, '=>', doc.data());
              users.push(doc.data());
            })
            // Match user
            authUser = users.find(user => {
              return user.email === email;
            });
            if (!authUser) {
              return done(null, false, { message: 'That email is not registered' });
            }
            // Match password
            bcrypt.compare(password, authUser.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, authUser);
              } else {
                return done(null, false, { message: 'Password incorrect' });
              }
            });
            return authUser;
          } else {
            throw new Error("Retrieving users failed")
          }
        })
        .catch(err => {
          console.log('Error getting documents', err);
        });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    userCollection
      .get()
      .then(querySnapshot => {
        console.log('deserialize:', user)
        if (querySnapshot) {
          const users = [];
          let authUser = {};
          querySnapshot.docs.forEach(doc => {
            // console.log(doc.id, '=>', doc.data());
            users.push(doc.data());
          })
          // Match user
          authUser = users.find(user => {
            return user.email === email;
          });
          done(err, user);
          return authUser;
        } else {
          throw new Error("Retrieving users failed")
        }
      })
      .catch(err => {
        console.log('Error deserializing user', err);
      });
  });
};