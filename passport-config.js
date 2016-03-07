var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('./models/user.js');

passport.use(new LocalStrategy({
    usernameField: 'userId',
    passwordField: 'apiKey'
  },
  function(userId, apiKey, done) {
    User.findOne({ userId: userId }, function (err, user) {
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

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = passport;
