const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
    cssStyles: ['forms', 'login-form'],
    isAuth: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res) => {
  User.findById('5efc9404711ce010d48bce03')
    .then((user) => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save((err) => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch((error) => console.log(error));
};

exports.getSignup = (req, res) => {
  res.render('auth/signup', {
    docTitle: 'Sign-up',
    path: '/signup',
    cssStyles: ['forms', 'login-form'],
    isAuth: false,
  });
};

exports.postSignup = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((error) => console.log(error));
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
