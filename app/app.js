require('dotenv').config();

var path = require('path');
var express = require('express');
var session = require('express-session');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var selfServiceRouter = require('./routes/selfservice');
var authRouter = require('./routes/auth');


async function main() {

    // initialize express
    var app = express();

    /**
     * Using express-session middleware for persistent user session. Be sure to
     * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
     */
    app.use(session({
        secret: process.env.EXPRESS_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // set this to true on production
        }
    }));

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hbs');

    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(logger('dev'));
    
    app.use(cookieParser());
    
    app.use(express.static(path.join(__dirname, 'public')));

    try {
        app.use('/', indexRouter);
        app.use('/srv', selfServiceRouter);
        app.use('/users', usersRouter);
        app.use('/auth', authRouter);
    
        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            next(createError(404));
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

        return app;

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = main;
