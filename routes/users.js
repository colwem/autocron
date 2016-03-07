"use strict";

var express = require('express');
var passport = require('passport');
var User = require('../models/user.js');

var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.user) {
    return res.redirect('/');
  }
  res.redirect('/user/login');
});

router.route('/login')

  .get(function(req, res){
    res.render('login');
  })

  .post(passport.authenticate('local', 
                              {successRedirect: '/',
                               failureRedirect: '/users/login'})); 

router.route('/register')

  .get(function(req, res){
    res.render('register', {});
  })

  .post(function(req, res){
    let user = new User({userId: req.body.userId,
              apiKey: req.body.apiKey });
    user.save()
    .then(function(user) {
      req.login(user, function(err){
        if (err) console.error(err);
        res.redirect('/');
        // res.redirect('/users/' + user.id);
      });
    })
    .catch(function(err) {
      req.flash("error", "User-Id already registered, try logging in");
      return res.redirect('register'); 
    })
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/:id', function(req, res){
  res.render('user/show');
})

module.exports = router;
