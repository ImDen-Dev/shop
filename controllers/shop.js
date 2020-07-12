const path = require('path');
const fs = require('fs');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        docTitle: 'Index',
        path: '/',
        cssStyles: ['product'],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        docTitle: 'My Shop',
        path: '/products',
        cssStyles: ['product'],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const id = req.params.id;
  Product.findById(id)
    .then((product) => {
      res.render('shop/product-detail', {
        prod: product,
        docTitle: product.title,
        path: '/products',
        cssStyles: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
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
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
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
          email: req.user.email,
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user })
    .then((orders) => {
      res.render('shop/orders', {
        docTitle: 'My Orders',
        path: '/orders',
        orders: orders,
        cssStyles: ['orders'],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice:', { underline: true });
      pdfDoc.text('-----------------------------------------');
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            `${prod.product.title}  -  ${prod.quantity} X ${prod.product.price} $`
          );
      });

      pdfDoc.text('----');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
