var express = require('express');
var path = require('path');
var Promise = require('bluebird');
var co = require('co');
var fs = Promise.promisifyAll(require('fs'));
var favicon = require('serve-favicon');
var rfs = require('rotating-file-stream');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();
var logDirectory = path.join(__dirname, 'log');

co(function *() {
    yield fs.statAsync(logDirectory)
    .then((stats) => {
        return stats.isDirectory();
    }).catch((err) => {
       console.error(err);
    });
});

var accessLogStream = rfs('access.log', {
    interval: '1d'
    , path: logDirectory
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('combined', {
    stream: accessLogStream
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/users', users);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;