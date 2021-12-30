const checkLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    next()
  } else {
    return res.redirect("/auth/login");
  }
};

module.exports = checkLogin;
