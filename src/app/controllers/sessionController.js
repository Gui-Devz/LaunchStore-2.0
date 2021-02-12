module.exports = {
  loginForm(req, res) {
    const { errorMessage } = req;

    console.log(req.errorCreate);
    return res.render("session/login");
  },

  async login(req, res) {
    // colocar o usuario no req.session
    const userID = req.user.rows[0].id;
    req.session.userID = userID;

    return res.redirect("/users");
  },
  logout(req, res) {
    try {
      req.session.destroy();
      return res.redirect("/");
    } catch (error) {
      console.error(error);
    }
  },
};
