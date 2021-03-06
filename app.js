var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var flash    = require('connect-flash');
var util = require('./routes/utils');
require('./config/passport')(passport);

var index = require('./routes/index');
var login = require('./routes/login');
var dmiat = require('./routes/dmiat');
var signup = require('./routes/signup');
var api = require('./routes/api');
var expressValidator = require('express-validator');

var dbConfig = require('./config/database');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(expressValidator());
app.use(cookieParser());
app.use('/public',express.static(path.join(__dirname, 'public')));
app.use(session({
    'secret':'2389472893748ur214',
    'resave':false,
    'saveUninitialized':false
}));
//Allow Cross Origin Requests
// app.use(function(req,res,next){
//     res.header("Access-Control-Allow-Origin","*");
//     res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
//passport configuration
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//MongoDB Configuration
mongoose.connect(dbConfig.url);



app.use('/', index);
app.use('/login',login);
app.use('/signup',signup);
app.use('/dmiat',dmiat);
app.use('/api',api);

/** Create a default admin on server startup */
util.createDefaultAdmin(function(err) {
    if(err) {
        console.log("Failed to create a default admin user.")
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
