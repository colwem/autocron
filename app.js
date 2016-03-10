'use strict';

let express      = require('express'),
    path         = require('path'),
    favicon      = require('serve-favicon'),
    logger       = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    session      = require('express-session'),
    routes       = require('./routes/index'),
    users        = require('./routes/users'),
    passport     = require('./passport-config.js'),
    mongoose     = require('mongoose'),
    flash        = require('connect-flash'),
    app          = express(),
    whats        = require('semantic-time-converter.js').starter(),
    MongoDBStore = require('connect-mongodb-session')(session),
    config       = require('config'),
    debug        = require('debug')('autocron:app');

debug(process.env.NODE_ENV);
if(app.get('env') === 'production') app.use(require('compression')());

let uri = config.get('database.url') + config.get('database.name');
debug(uri);
console.log(uri);
mongoose.connect(uri);

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

let sess = {
  resave: false,
  saveUninitialized: false,
  secret: 'blah',
  cookie: {}
}

// authentication and session setup
if( app.get('env') === 'production' ) {
  // sess.cookie.secure = true;
  debug(49);
  sess.cookie.maxAge = whats(3).weeks.in.milleseconds;
  sess.store = new MongoDBStore(
    { uri: config.get('database.url') + 'sessions',
      collection: 'sessions' });
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
