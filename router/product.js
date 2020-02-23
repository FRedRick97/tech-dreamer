const router = require('express').Router();
const Category = require('../models/category');
const Product = require('../models/product');
const multer = require('multer');
const secret = require('../config/secret');

const path = require('path');

//multer

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage
}).single('productImage');

var id;

router.get('/add-product', function (req, res, next) {
    if (req.user.email == 'admin@gmail.com') {
        res.render('admin/add-product', {
            error: req.flash('error'),
            message: req.flash('message')
        });
    } else {
        res.redirect('/');
    }
});

router.post('/add-product', function (req, res, next) {
    Category.findOne({ name: req.body.name }, function (err, category) {
        if (err) next(err);

        if (category == null) {
            req.flash('error', 'No such Category found!');
            return res.redirect('/add-product');

        }
        else {
            id = category._id;
            // req.flash('success', 'Product Added');
            res.redirect('/add-product/new-product');
        }
    });
});

router.get('/add-product/new-product', function (req, res, next) {
    if (req.user.email == 'admin@gmail.com') {
        res.render('admin/new-product', {
            success: req.flash('success'),
            error: req.flash('error')
        });
    } else {
        res.redirect('/');
    }

});

router.post('/add-product/new-product', upload, function (req, res, next) {
    // console.log(req.file);
    // upload(req, res, (err) => {
    //     console.log(req.file);
    //     return res.redirect('/add-product/new-product');
    // });
    // console.log(id);
    var product = new Product();
    product.category = id;
    product.name = req.body.name;
    product.price = req.body.price;
    product.image = req.file.path;
    product.save(function (err) {
        if (err) next(err);

        req.flash('message', 'Product added to the database!!');
        return res.redirect('/add-product');
    });
});



module.exports = router;
