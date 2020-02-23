const router = require('express').Router();
const Category = require('../models/category');


router.get('/add-category', function (req, res, next) {
    if (req.user.email == 'admin@gmail.com') {
        res.render('admin/add-category', {
            message: req.flash('success'),
            error: req.flash('error')
        });
    }
    else {
        res.redirect('/');
    }
});

router.post('/add-category', function (req, res, next) {
    var category = Category();

    category.name = req.body.name;
    category.save(function (err) {
        if (err) {
            req.flash('error', 'This category already exists!');
            return res.redirect('/add-category');
        }

        req.flash('success', 'Category successfully added!');
        return res.redirect('/add-category');
    });
});

module.exports = router;



