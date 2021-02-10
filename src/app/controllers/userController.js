const User = require("../models/User");
const { formatCpfCnpj, formatCep } = require("../../lib/utils");

module.exports = {
  registerForm(req, res) {
    return res.render("user/register");
  },

  async show(req, res) {
    const { userId: id } = req.session;

    const results = await User.findOne({ where: { id } });
    const user = results.rows[0];

    if (!user)
      return res.render("user/register", {
        error: "Usuário não encontrado!",
      });

    user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj);
    user.cep = formatCep(user.cep);

    return res.render("user/index", { user });
  },

  async post(req, res) {
    const userID = await User.create(req.body);

    req.session.userId = userID;

    return res.redirect(`/${userID}`);
  },
};
