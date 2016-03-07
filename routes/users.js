'use strict';

let express = require('express');
let passport = require('passport');
let User = require('../models/user.js');

let router = express.Router();

router.get('/', (req, res, next) => {
  if(req.user) {
    return res.redirect('/');
  }
  res.redirect('/user/login');
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
    res.render('register', {});
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

router.get('/:id', (req, res) => {
  res.render('user/show');
})

module.exports = router;
