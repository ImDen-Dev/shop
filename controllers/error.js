exports.errorPage = (req, res, nex) => {
  res
    .status(404)
    .render('404', {
      docTitle: 'Page not found',
      path: null,
      cssStyles: [],
      isAuth: req.session.isLoggedIn,
    });
};
