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


let dbName = 'autocron',
    dbUrl  = 'mongodb://localhost/'

switch(app.get('env')) {
  case 'test':
    dbName = 'autocron_test';
    break;
  case 'production':
    app.use(require('compression')());
    dbUrl = process.env.OPENSHIFT_MONGODB_DB_URL
    break;
}

mongoose.connect(dbUrl + dbName);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if( process.env.NODE_ENV !== 'test' ) {
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// authentication and session setup
let sess = {
  resave: false,
  saveUninitialized: false,
  secret: 'blah',
  cookie: {}
}
if( app.get('env') === 'production' ) {
  sess.cookie.secure = true;
  sess.cookie.maxAge = 2592000;
}
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());

// flash and message system setup
app.use(flash());
app.use((req, res, next) =>{
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// static stuff setup
let bootstrap = require('bootstrap-styl'),
    stylus = require('stylus');

app.use(stylus
  .middleware(path.join(__dirname, 'public'),
    {compile: (str) => {
      return stylus(str)
        .use(bootstrap());
    }}));
app.use(express.static(path.join(__dirname, 'public')));

// global template variables setup
app.use( (req, res, next) =>{
  res.locals.title = "AutoCron";
  res.locals.user = req.user;
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
