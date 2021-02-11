const User = require("../models/User");
const { formatCpfCnpj, formatCep } = require("../../lib/utils");

module.exports = {
  registerForm(req, res) {
    return res.render("user/register");
  },

  async show(req, res) {
    try {
      const { user } = req;

      user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj);
      user.cep = formatCep(user.cep);

      return res.render("user/index", { user });
    } catch (error) {
      console.error(error);
    }
  },

  async post(req, res) {
    try {
      const userID = await User.create(req.body);

      req.session.userId = userID;

      return res.redirect(`/${userID}`);
    } catch (error) {
      console.error(error);
    }
  },

  async update(req, res) {
    try {
      const { user } = req;
      const userID = user.rows[0].id;

      let { name, email, cpf_cnpj, cep, address } = req.body;

      cpf_cnpj = cpf_cnpj.replace(/\D/g, "");
      cep = cep.replace(/\D/g, "");

      await User.update(userID, {
        name,
        email,
        cpf_cnpj,
        cep,
        address,
      });

      return res.render("user/index", {
        success: "Conta atualizada com sucesso!",
        user: req.body,
      });
    } catch (error) {
      console.error(error);
      return res.render("user/index", {
        error: `Ops.... Ocorreu um erro!`,
      });
    }
  },
};
