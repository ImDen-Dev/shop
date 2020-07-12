const crypto = require('crypto');

const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  auth: {
    user: 'neckromant90@gmail.com',
    pass: 'hqklarejrqiqnajf',
  },
});

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   secure: false,
//   auth: {
//     user: 'neckromant90@gmail.com',
//     pass: 'hqklarejrqiqnajf',
//   },
// });

exports.getLogin = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
    cssStyles: ['forms', 'login-form'],
    errorMessage: message,
    oldInput: { email: '', password: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', {
      docTitle: 'Login',
      path: '/login',
      cssStyles: ['forms', 'login-form'],
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
      validationErrors: errors.array(),
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.render('auth/login', {
          docTitle: 'Login',
          path: '/login',
          cssStyles: ['forms', 'login-form'],
          errorMessage: 'Invalid email or password',
          oldInput: { email, password },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              console.log(err);
              return res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password');
          res.render('auth/login', {
            docTitle: 'Login',
            path: '/login',
            cssStyles: ['forms', 'login-form'],
            errorMessage: 'Invalid email or password',
            oldInput: { email, password },
            validationErrors: [],
          });
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSignup = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    docTitle: 'Sign-up',
    path: '/signup',
    cssStyles: ['forms', 'login-form'],
    isAuth: false,
    errorMessage: message,
    oldInput: { email: '', password: '', confirmPassword: '' },
    validationErrors: [],
  });
};

exports.postSignup = (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      docTitle: 'Sign-up',
      path: '/signup',
      cssStyles: ['forms', 'login-form'],
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      res.redirect('/login');
      // return transporter
      //   .sendMail({
      //     from: 'neckromant90@gmail.com',
      //     to: email,
      //     subject: 'Sending Email using Node.js',
      //     text: 'That was easy!',
      //   })
      //   .catch((error) => {
      //     console.log('Mail error', error);
      //   });
    });
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getReset = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    docTitle: 'Reset Password',
    path: '/reset',
    cssStyles: ['forms', 'login-form'],
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buf) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buf.toString('hex');
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        res.redirect('/');
        // transporter
        //   .sendMail({
        //     from: 'Node@App.com',
        //     to: req.body.email,
        //     subject: 'Password reset',
        //     html: `
        //       <p>You requested a password reset</p>
        //       <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
        //     `,
        //   })
        //   .catch((error) => {
        //     console.log('Mail error', error);
        //   });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        docTitle: 'New Password',
        path: '/new-password',
        cssStyles: ['forms', 'login-form'],
        errorMessage: message,
        userId: user._id.toString(),
        userToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { password, userToken, userId } = req.body;
  let resetUser;
  User.findOne({
    resetToken: userToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
