module.exports = {
    database: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tech-dreamer',
    port:  process.env.PORT || 1337,
    secretKey: 'helloworld',

};