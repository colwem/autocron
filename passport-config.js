'use strict';

let passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('./models/user.js');

passport.use(new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'apiKey'
  },
  (userId, apiKey, done) => {
    User.findOne({ userId: userId },  (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validApiKey(apiKey)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
