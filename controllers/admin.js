const Product = require('../models/product');

exports.getProducts = (req, res) => {
  Product.find()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        docTitle: 'Admin products',
        path: '/admin/products',
        cssStyles: ['product'],
        isAuth: req.session.isLoggedIn,
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
    isAuth: req.session.isLoggedIn,
  });
};

exports.postAddProduct = (req, res) => {
  const { title, imageUrl, price, description } = req.body;
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
        isAuth: req.session.isLoggedIn,
      });
    })
    .catch((error) => console.log(error));
};

exports.postEditProduct = (req, res) => {
  const { productId, title, price, description, imageUrl } = req.body;
  const product = { title, price, description, imageUrl };
  Product.findByIdAndUpdate(productId, product)
    .then(() => {
      console.log('Product was Updated');
      res.redirect('/admin/products');
    })
    .catch((error) => console.log(error));
};

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then((result) => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch((error) => console.log(error));
};
