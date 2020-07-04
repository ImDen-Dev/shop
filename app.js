const path = require('path');
const MONGODB_API = require('./util/API_KEYS');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const User = require('./models/user');

const app = express();
const csrfProtection = csrf();

const adminRouter = require('./routes/admin');
const shopRouter = require('./routes/shop');
const authRouter = require('./routes/auth');
const errorController = require('./controllers/error');

const store = new MongoDBStore({
  uri: MONGODB_API.MONGODB_API_KEY,
  collection: 'sessions',
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((error) => console.log(error));
});

app.use((req, res, next) => {
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRouter);
app.use(shopRouter);
app.use(authRouter);
app.use(errorController.errorPage);

mongoose
  .connect(MONGODB_API.MONGODB_API_KEY, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    return User.findOne();
  })
  .then((user) => {
    if (!user) {
      const user = new User({
        name: 'Den',
        email: 'test@test.com',
        cart: {
          items: [],
        },
      });
      user.save();
    }
    app.listen(3000);
  })
  .catch((error) => console.log(error));
