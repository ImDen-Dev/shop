const { validationResult } = require('express-validator');

const Product = require('../models/product');

exports.getProducts = (req, res) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        docTitle: 'Admin products',
        path: '/admin/products',
        cssStyles: ['product'],
      });
    })
    .catch((error) => console.log(error));
};

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    docTitle: 'Add product',
    path: '/admin/add-product',
    cssStyles: ['forms', 'product'],
    editMode: false,
    errorMsg: null,
    hasError: false,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res) => {
  const { title, imageUrl, price, description } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add product',
      path: '/admin/edit-product',
      cssStyles: ['forms', 'product'],
      editMode: false,
      prod: {
        title,
        imageUrl,
        price,
        description,
      },
      errorMsg: errors.array()[0].msg,
      hasError: true,
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      res.redirect('/');
    })
    .catch((error) => console.log(error));
};

exports.getEditProduct = (req, res) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;

  if (!editMode) {
    return res.redirect('/');
  }

  Product.findById(prodId)
    .then((prod) => {
      if (!prod) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        docTitle: 'Edit product',
        path: '/admin/edit-product',
        cssStyles: ['forms', 'product'],
        editMode: editMode,
        prod: prod,
        errorMsg: null,
        hasError: false,
        validationErrors: [],
      });
    })
    .catch((error) => console.log(error));
};

exports.postEditProduct = (req, res) => {
  const { productId, title, price, description, imageUrl } = req.body;
  const userId = req.user._id;
  const product = { title, price, description, imageUrl, _id: productId };
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('admin/edit-product', {
      docTitle: 'Edit product',
      path: '/admin/edit-product',
      cssStyles: ['forms', 'product'],
      editMode: true,
      prod: product,
      errorMsg: errors.array()[0].msg,
      hasError: true,
      validationErrors: errors.array(),
    });
  }

  Product.findOneAndUpdate({ _id: productId, userId: userId }, product)
    .then((result) => {
      if (result) {
        console.log('Product was Updated');
      }
      res.redirect('/admin/products');
    })
    .catch((error) => console.log(error));
};

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  Product.findOneAndRemove({ _id: prodId, userId: req.user.id })
    .then((result) => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch((error) => console.log(error));
};
