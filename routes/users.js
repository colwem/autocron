'use strict';

let express  = require('express'),
    passport = require('passport'),
    User     = require('../models/user.js'),
    router   = express.Router(),
    debug    = require('debug')('autocron:routes/users'),
    config   = require('config'),
    api      = require('@colwem/habitica-api-client').getConnection(config.get('api.url'));

let testUserId = 'bfea558d-aa49-41e7-8b3e-a3c717907816',
    testApiKey = '7baa1947-7c06-4f0a-8883-863148cbf34b',
    realUserId = '041abe75-7ebc-4e11-a32d-9d54f77d74f8',
    realApiKey = 'f467f90c-3291-4020-b7c0-fc055e0bd826';

router.get('/', loggedIn, api.attachUser, (req, res) => {
  res.render('user/show');
});


// /users/login
router.route('/login')
  .get((req, res) => {
      res.render('login', {userId: null,
                          apiKey:  null});
  })

  .post((req, res) => {
    let creds = {
      userId: req.body.userId,
      apiKey: req.body.apiKey
    }
    User.findOne(creds)
    .then((user) => {
      if(!user) {

        return User.register(creds);
      }
      return user;
    })
    .then((user) => {
      req.login(user, (err) => {
        flashError(err, req);

        res.redirect('/users/');
      });
    })
    .catch((err) => {
      debug(err.stack);
      flashError(err, req);

      return res.redirect('/users/login');
    })
  });




// /users/logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.post('/update', loggedIn, api.attachUser, (req, res) => {
  let user = Object.assign(req.user, req.body);

  user.timeZoneOffset = req.apiUser.preferences.timezoneOffset;

  return user.save()
  .then((user) => {

    return res.send('ok');
  })
  .catch((err) => {
    debug(err.stack);
    return res.send('not ok');
  });
});

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    // req.flash('warning', 'You need to be logged in to do that')
    res.redirect('/users/login');
  }
}

function flashError(err, req) {
  let str = err
  if(err instanceof Error) {
    str = err.toString();
  } else if( typeof err === 'object' ) {
    str = JSON.stringify(err, null, 2);
  }
  return req.flash('danger', str);
}

function getTimezone(apiUser) {
}

module.exports = router;
