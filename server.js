const path = require('path');

const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const bodyparser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session); // db to store session

const User = require('./models/user');
const Category = require('./models/category');
const mongoose = require('./db/mongoose');
const secret = require('./config/secret');
const cartLength = require('./middleware/middleware');

//Routes
const mainRouter = require(__dirname + '/router/main');
const userRouter = require(__dirname + '/router/user');
const adminRouter = require(__dirname + '/router/admin');
const productRouter = require(__dirname + '/router/product');
var upload = multer({ dest: './uploads' });

const port = secret.port;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static('uploads'));
app.use('/assets', express.static(__dirname + '/public'));

// Middleware
app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    resave: true, // force session to be saved
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new MongoStore({ url: secret.database, autoReconnect: true })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.user = req.user; //creates a local variable user for all the routes
    next();
});

app.use(function (req, res, next) {
    Category.find({}, function (err, categories) {
        if (err) next(err);
        res.locals.categories = categories;
        next();
    });
});

app.use(cartLength);

app.use(mainRouter);
app.use(userRouter);
app.use(adminRouter);
app.use(productRouter);


app.listen(port, function () {
    console.log(`Server is up on port ${port}`);
});

