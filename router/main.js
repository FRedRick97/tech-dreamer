const router = require('express').Router();
const Product = require('../models/product');
const Cart = require('../models/cart');

function pagination(req, res, next) {
    var perPage = 9;
    var page = parseInt(req.params.page - 1);

    Product
        .find()
        .skip(perPage * page)
        .limit(perPage)
        .populate('category')
        .exec(function (err, products) {
            if (err) return next(err);
            Product.count().exec(function (err, count) {
                if (err) return next(err);

                var img_url = [products.length];
                for (var i = 0; i < products.length; i++) {
                    img_url[i] = req.protocol + '://' + req.get('host') + '/' + products[i].image.replace('uploads/', '/');
                }
                console.log('PAGES  ==== ' + parseInt((count / perPage) + 1));
                res.render('main/product-main', {
                    products: products,
                    image: img_url,
                    pages: parseInt((count / perPage) + 1)
                });
            });
        });

}

Product.createMapping(function (err, mapping) {
    if (err) {
        console.log('Error Occured\n\n');
        console.log(err);
    } else {
        console.log('Mapping Created');
        console.log(mapping);
    }
});

var stream = Product.synchronize();

var count = 0;

stream.on('data', function () { count++; });

stream.on('close', function () {
    console.log("Indexed " + count + " documents");
});

stream.on('error', function (err) {
    console.log(err);
});

router.post('/search', function (req, res, next) {
    res.redirect('/search?q=' + req.query.q);
});

router.get('/search', function (req, res, next) {
    console.log("query = " + req.query.q);
    if (!req.query.q) {
        res.redirect('/');
    } else {
        Product.search({
            query_string: {
                query: req.query.q
            }
        }, function (err, results) {
            if (err) return err;

            var length = parseInt(JSON.stringify(results.hits.total));

            var img_url = [];
            var name = [];
            var price = [];
            var id = [];
            for (var i = 0; i < length; i++) {
                img_url[i] = req.protocol + '://' + req.get('host') + '/' + JSON.stringify(results.hits.hits[i]._source.image).slice(1, -1).replace('uploads/', '/');
                id[i] = JSON.stringify(results.hits.hits[i]._id).slice(1, -1);
                // console.log('Image After = ' + img_url);
                name[i] = JSON.stringify(results.hits.hits[i]._source.name).slice(1, -1);
                price[i] = JSON.stringify(results.hits.hits[i]._source.price);
            }

            res.render('main/search-result', {
                query: req.query.q,
                length: length,
                id: id,
                data: JSON.stringify(results.hits.hits),
                image: img_url,
                name: name,
                price: price
            });
        });
    }
});

router.get('/', function (req, res, next) {
    if (req.user) {
        res.redirect('/page/1');
    } else {
        res.render('main/home');

    }
});

router.get('/page/:page', function (req, res, next) {
    pagination(req, res, next);
});

router.get('/about', function (req, res) {
    res.render('main/about');
});

router.get('/category/:id', function (req, res, next) {
    // we find product with its category.
    Product
        .find({ category: req.params.id })
        .populate('category')
        .exec(function (err, products) {
            if (err) next(err);
            var img_url = [products.length];
            for (var i = 0; i < products.length; i++) {
                img_url[i] = req.protocol + '://' + req.get('host') + '/' + products[i].image.replace('uploads/', '/');
            }
            res.render('main/category', {
                products: products,
                image: img_url
            });
        });
});

router.get('/product/:id', function (req, res, next) {
    Product.findById({ _id: req.params.id }, function (err, product) {
        if (err) next(err);
        // protocol = http, host = localhost:1337 for offline.
        var img_url = req.protocol + '://' + req.get('host') + '/' + product.image.replace('uploads/', '/');

        res.render('main/product', {
            product: product,
            image: img_url
        });
    });
});

router.post('/product/:id', function (req, res, next) {
    if (req.user) {
        Cart.findOne({ owner: req.user._id }, function (err, cart) {
            cart.items.push({
                item: req.body.product_id,
                quantity: req.body.quantity,
                price: parseFloat(req.body.priceValue)
            });
            cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

            cart.save(function (err) {
                if (err) return next(err);
                return res.redirect('/cart');
            });
        });
    }
});

module.exports = router;
