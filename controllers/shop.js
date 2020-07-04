const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        docTitle: 'Index',
        path: '/',
        cssStyles: ['product'],
        isAuth: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};

exports.getProducts = (req, res) => {
  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        docTitle: 'My Shop',
        path: '/products',
        cssStyles: ['product'],
        isAuth: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};

exports.getProduct = (req, res) => {
  const id = req.params.id;
  Product.findById(id)
    .then((product) => {
      res.render('shop/product-detail', {
        prod: product,
        docTitle: product.title,
        path: '/products',
        cssStyles: [],
        isAuth: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};

exports.getCart = (req, res) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        docTitle: 'My Cart',
        path: '/cart',
        products: products,
        cssStyles: ['cart'],
        isAuth: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((error) => console.log(error));
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((error) => console.log(error));
};

exports.postOrder = (req, res) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((p) => {
        return {
          product: { ...p.productId._doc },
          quantity: p.quantity,
        };
      });
      const order = new Order({
        products: products,
        user: {
          name: req.user.name,
          userId: req.user,
        },
      });
      return order.save();
    })
    .then(() => {
      req.user.cart.items = [];
      return req.user.save();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch((error) => console.log(error));
};

exports.getOrders = (req, res) => {
  Order.find({ 'user.userId': req.user })
    .then((orders) => {
      res.render('shop/orders', {
        docTitle: 'My Orders',
        path: '/orders',
        orders: orders,
        cssStyles: ['orders'],
        isAuth: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};
