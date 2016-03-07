'use strict';

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let routes = require('./routes/index');
let users = require('./routes/users');
let passport = require('./passport-config.js');
let mongoose = require('mongoose');
let flash = require('connect-flash');

let app = express();
mongoose.connect('mongodb://localhost/autocron');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// authentication and session setup
app.use(session({resave: false, saveUninitialized: false, secret: 'blah'}));
app.use(passport.initialize());
app.use(passport.session());

// flash and message system setup
app.use(flash());
app.use((req, res, next) =>{
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// static stuff setup
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// global template variables setup
app.use( (req, res, next) =>{
  res.locals.title = "AutoCron";
  next();
});

// routers setup
app.use('/', routes);
app.use('/users?', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
