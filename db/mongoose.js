const mongoose = require('mongoose');
const secret = require('../config/secret');

mongoose.Promise = global.Promise;

mongoose.connect(secret.database, { keepAlive: 120 }, (err) => {
    if (err) return console.log(err);
    else return console.log('Connected');
});


module.exports = mongoose;
