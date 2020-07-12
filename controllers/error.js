exports.get404 = (req, res, nex) => {
  res.status(404).render('404', {
    docTitle: 'Page not found',
    path: null,
    cssStyles: [],
    isAuth: req.session.isLoggedIn,
  });
};
exports.get500 = (req, res, nex) => {
  res.status(500).render('500', {
    docTitle: 'Error',
    path: null,
    cssStyles: [],
    isAuth: req.session.isLoggedIn,
  });
};
