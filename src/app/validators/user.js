const { validationOfBlankForms } = require("../../lib/utils");
const User = require("../models/User");
const { compare } = require("bcryptjs");

async function show(req, res, next) {
  try {
    const { userID: id } = req.session;

    const user = await User.findOne({ where: { id } });

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

    if (user) {
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
  const { password } = req.body;
  const id = req.session.userID;
  try {
    //filled all fields
    if (validationOfBlankForms(req.body)) {
      return res.render("user/index", {
        error: "Por favor, preencha todos os campos do formulário",
        user: req.body,
      });
    }

    //password match
    const user = await User.findOne({ where: { id } });

    if (!user)
      return res.render("user/register", {
        error: "Usuário não encontrado!",
      });

    const passed = await compare(password, user.password);

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

async function deleteUser(req, res, next) {
  const { password } = req.body;
  const id = req.session.userID;
  try {
    //filled all fields
    if (validationOfBlankForms(req.body)) {
      return res.render("user/index", {
        error: "Por favor, preencha todos os campos do formulário",
        user: req.body,
      });
    }

    //password match
    const user = await User.findOne({ where: { id } });

    if (!user)
      return res.render("user/register", {
        error: "Usuário não encontrado!",
      });

    const passed = await compare(password, user.password);

    if (!passed)
      return res.render("user/index", {
        user: user,
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
  deleteUser,
};
