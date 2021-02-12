function onlyUsers(req, res, next) {
  if (!req.session.userID) {
    const errorCreate = "Crie uma conta para anúnciar um produto!";
    return res.render("session/login", { error: errorCreate });
  }

  next();
}

function isLoggedRedirectToUsers(req, res, next) {
  if (req.session.userID) {
    return res.redirect("/users");
  }

  next();
}

module.exports = {
  onlyUsers,
  isLoggedRedirectToUsers,
};
