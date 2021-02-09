const { formatPricing, formatPath } = require("../../lib/utils");
const Product = require("../models/Product");

module.exports = {
  registerForm(req, res) {
    return res.render("user/register");
  },
};
