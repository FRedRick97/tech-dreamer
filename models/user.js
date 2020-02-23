const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const MD5 = require('md5.js');


// user schema

var userSchema = new mongoose.Schema({
    email: {
        type: String, unique: true, lowercase: true
    },
    password: {type: String, minlength: 3},
    profile: {
        name: { type: String, default: '' },
        picture: { type: String, default: '' }
    },
    address: String,
    history: [{
        date: Date,
        paid: { type: Number, default: 0 },
        // item: {type: Schema.Types.ObjectId, ref: ''}
    }]
});


// hash the password
userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function (err, salt) {
        if (err)
            return next(err);
        // here 3rd parameter is progress
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err)
                return next(err);
            user.password = hash;
            next();
        });
    });
});
// custom method compare passwords
userSchema.methods.comparePasswords = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.gravatar = function(size) {
    if(!this.size) size = 200;
    if(!this.email) return 'http://gravatar.com/avatar/?s' + size;
    var md5 = new MD5().update(this.email).digest('hex');
    const url= 'https://www.gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
    console.log(url);
    return url;
};

var User = mongoose.model('User', userSchema);

module.exports = User;
