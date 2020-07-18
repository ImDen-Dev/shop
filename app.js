const path = require('path');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const MONGODB_API = require('./util/API_KEYS');
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

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
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
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((error) => {
      next(new Error(error));
    });
});

app.use('/admin', adminRouter);
app.use(shopRouter);
app.use(authRouter);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render('500', {
    docTitle: 'Error',
    path: '/500',
    cssStyles: [],
    isAuth: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_API.MONGODB_API_KEY, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then((result) => {
    app.listen(3000);
  })
  .catch((error) => console.log(error));
