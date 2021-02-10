const {
  formatPricing,
  formatPath,
  validationOfBlankForms,
} = require("../../lib/utils");
const User = require("../models/User");

async function post(req, res, next) {
  //check if has all fields
  if (validationOfBlankForms(req.body)) {
    return res.render("user/register", {
      error: "Por favor, preencha todos os campos do formulário",
      user: req.body,
    });
  }

  //check if user exists [email, cpf_cnpj]
  let { email, cpf_cnpj, password, passwordRepeat } = req.body;

  cpf_cnpj = cpf_cnpj.replace(/\D/g, "");

  const user = await User.findOne({
    where: { email },
    or: { cpf_cnpj },
  });

  if (user.rows.length > 0) {
    return res.render("user/register", {
      error: "Usuário já cadastrado!",
      user: req.body,
    });
  }

  //check if password match
  if (password !== passwordRepeat) {
    return res.render("user/register", {
      error: "As senhas não são iguais!",
      user: req.body,
    });
  }

  next();
}

module.exports = {
  post,
};
