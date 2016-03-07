'use strict';

let express  = require('express'),
    passport = require('passport'),
    User     = require('../models/user.js'),
    router   = express.Router(),
    h        = require('../test/helpers');

router.get('/', loggedIn, (req, res, next) => {
  res.redirect('/');
});


router.route('/login')
  .get((req, res) => {
    res.render('login');
  })

  .post(passport.authenticate('local', 
                              {successRedirect: '/',
                               failureRedirect: '/users/login'})); 


router.route('/register')
  .get((req, res) => {
    res.render('register', {userId: h.uuidGenerator(),
                  apiKey: h.uuidGenerator()});
  })

  .post((req, res) => {
    let user = new User({userId: req.body.userId,
              apiKey: req.body.apiKey });
    user.save()
    .then((user) => {
      req.login(user, (err) => {
        if (err) console.error(err);
        res.redirect('/');
        // res.redirect('/users/' + user.id);
      });
    })
    .catch((err) => {
      req.flash("error", "User-Id already registered, try logging in");
      return res.redirect('register'); 
    })
  });


router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


router.get('/:id', loggedIn, (req, res) => {
  res.render('user/show');
})

function loggedIn(req, res, next) {
  console.log("in loggedIn");
  if (req.user) {
    next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;
