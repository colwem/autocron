'use strict';

let passport      = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , User          = require('./models/user.js')
  , debug         = require('debug')('autocron:passport-config')
  , mongoose      = require('mongoose');

passport.use(new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'apiKey'
  },
  (userId, apiKey, done) => {
    debug(14);
    User.findOne({ userId: userId })
    .then((user) => {
      debug(17);
      if (!user) {
        debug(19);
        return done(
          null,
          false,
          { message: 'User Id does not exist or has not been registered' });
      }
      if (!user.validApiKey(apiKey)) {
        debug(26);
        return done(null, false, { message: 'Incorrect Api Token' });
      }
      debug(29);
      return done(null, user);
    })
    .catch((err) => {
      debug(29);
      return done(err);
    });
  }
));

passport.serializeUser((user, done) => {
  debug(40);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  debug(45);
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
