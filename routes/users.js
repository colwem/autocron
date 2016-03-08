'use strict';

let express  = require('express'),
    passport = require('passport'),
    User     = require('../models/user.js'),
    router   = express.Router(),
    h        = require('../test/helpers'),
    api      = require('../lib/api');


router.get('/', loggedIn, api.attachUser(), (req, res) => {
  res.render('user/show');
});


// /users/login
router.route('/login')
  .get((req, res) => {
    res.render('login', {userId: 'bfea558d-aa49-41e7-8b3e-a3c717907816',
                        apiKey: '7baa1947-7c06-4f0a-8883-863148cbf34b'});
  })

  .post(passport.authenticate('local', 
                              {successRedirect: '/users/',
                               failureRedirect: '/users/login'})); 


// /users/register
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
        res.redirect('/users/');
        // res.redirect('/users/' + user.id);
      });
    })
    .catch((err) => {
      req.flash("error", "User-Id already registered, try logging in");
      return res.redirect('register'); 
    })
  });


// /users/logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


// [GET,POST]/users/edit
router.route('/edit')
  .get(loggedIn, (req, res) => {
    res.render('user/edit'); 
  })

  .post(loggedIn, (req, res) => {
    req.user.cronTime = req.body.cronTime;
    req.user.save()
    .then((user) => {
      res.redirect('/users/');
    })
    .catch((err) => {
      req.flash("error", err)
      res.redirect('/user/edit')
    });
  })


function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/users/login');
  }
}

module.exports = router;
