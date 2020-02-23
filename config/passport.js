const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// serialize and decserialize
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Middleware

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    User.findOne({ email: email}, function(err, user) {
        if (err) return done(err);

        if(!user) {
            return done(null, false, req.flash('loginMessage', 'No such user exists.'));
        }

        if(!user.comparePasswords(password)) {
            return done(null, false, req.flash('loginMessage', 'Wrong Password'));
        }

        return done(null, user);
    });
}));

// custom function to validate

exports.isAuthenticated = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
};


