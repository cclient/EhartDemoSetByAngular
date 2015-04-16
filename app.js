var express = require('express');
var engine = require('ejs-locals');

var path = require('path');
global.__base = __dirname + '/';
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./lib/route.js');
var yunOauth = require('yun-oauth');
var passport = require('passport');

var app = express();
var auth = require('http-auth');
var basic = auth.basic({
    realm: "Simon Area.",
    file: __dirname + "/httpUsers" // gevorg:gpass, Sarah:testpass ...
});

// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
//app.use(logger('dev'));
app.use(auth.connect(basic));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
// app.use(yunOauth.middleware());
app.use(express.static(path.join(__dirname, 'public')));
yunOauth.easyAuth(app, { host: '127.0.0.1:9527', clientSecret:'yqiomhi433ufuiqi5o8zdelgdwqp29gq', clientID: "c7dmkpwhm6d37e1qa0f6vra2o7kc4g4e" });
app.use('/', routes);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
// var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
    res.status(404);
    res.render('404');
});
/// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err)
        res.status(err.status || 500);
        res.render('500', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err)
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
