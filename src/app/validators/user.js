const { validationOfBlankForms } = require("../../lib/utils");
const User = require("../models/User");
const { compare } = require("bcryptjs");

async function show(req, res, next) {
  try {
    const { userId: id } = req.session;

    const results = await User.findOne({ where: { id } });
    const user = results.rows[0];

    if (!user)
      return res.render("user/register", {
        error: "Usuário não encontrado!",
      });

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
  }
}
async function post(req, res, next) {
  try {
    //check if has all fields
    if (validationOfBlankForms(req.body)) {
      return res.render("user/register", {
        error: "Por favor, preencha todos os campos do formulário",
        user: req.body,
      });
    }

    let { email, cpf_cnpj, password, passwordRepeat } = req.body;

    cpf_cnpj = cpf_cnpj.replace(/\D/g, "");

    //check if user exists [email, cpf_cnpj]
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
  } catch (error) {
    console.error(error);
  }
}
async function update(req, res, next) {
  try {
    //filled all fields
    if (validationOfBlankForms(req.body)) {
      return res.render("user/index", {
        error: "Por favor, preencha todos os campos do formulário",
        user: req.body,
      });
    }

    //has password
    const { id, password } = req.body;
    if (!password)
      return res.render("user/index", {
        user: req.body,
        error: "Coloque a sua senha para atualizar o seu cadastrado",
      });

    //password match
    const user = await User.findOne({ where: { id } });

    if (!user)
      return res.render("user/register", {
        error: "Usuário não encontrado!",
      });

    const userPassword = user.rows[0].password;

    const passed = await compare(password, userPassword);

    if (!passed)
      return res.render("user/index", {
        user: req.body,
        error: "Senha incorreta!",
      });

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  post,
  show,
  update,
};
