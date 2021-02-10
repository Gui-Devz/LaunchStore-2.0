const {
  formatPricing,
  formatPath,
  validationOfBlankForms,
} = require("../../lib/utils");
const User = require("../models/User");

module.exports = {
  registerForm(req, res) {
    return res.render("user/register");
  },

  async post(req, res) {
    const userID = await User.create(req.body);

    return res.redirect(`users/${userID}`);
  },
};
