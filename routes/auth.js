const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const User = require('../models/user');
const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.post(
  '/login',
  [
    check('email', 'Email is not valid!!!').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 5 characters!')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email!')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Email already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password', 'please enter valid password!!!')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password have to match!');
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
