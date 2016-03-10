'use strict';

let express  = require('express'),
    passport = require('passport'),
    User     = require('../models/user.js'),
    router   = express.Router(),
    debug    = require('debug')('autocron:routes/users'),
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
                               failureRedirect: '/users/login',
                               failureFlash: {type: 'danger'},
                               successFlash: 'Welcome!'}));


// /users/register
router.route('/register')
  .get((req, res) => {
    res.render('register', {userId: h.uuidGenerator(),
                  apiKey: h.uuidGenerator()});
  })

  .post((req, res) => {
    debug(39);
    User.register({userId: req.body.userId,
                  apiKey: req.body.apiKey })
    .then((user) => {
      debug(43);
      req.flash('success', 'Successfully registered')
      req.login(user, (err) => {
        debug(46);
        if (err) req.flash('danger', JSON.stringify(err, null, 2))
        res.redirect('/users/');
      });
    })
    .catch((err) => {
      debug(52);
      if( typeof err === "object" ) err = JSON.stringify(err, null, 2);
      req.flash("danger", err);
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
      req.flash("success", "Edit successful")
      res.redirect('/users/');
    })
    .catch((err) => {
      req.flash("danger", err)
      res.redirect('/user/edit')
    });
  })


function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.flash('warning', 'You need to be logged in to do that')
    res.redirect('/users/login');
  }
}

module.exports = router;
