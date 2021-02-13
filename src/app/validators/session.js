const { validationOfBlankForms } = require("../../lib/utils");
const User = require("../models/User");
const { compare } = require("bcryptjs");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    //filled all fields
    if (validationOfBlankForms(req.body)) {
      return res.render("session/login", {
        error: "Por favor, preencha todos os campos do formulário",
        user: req.body,
      });
    }

    //password match
    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.render("session/login", {
        user: req.body,
        error: "Email não encontrado!",
      });

    const userPassword = user.password;

    const passed = await compare(password, userPassword);

    if (!passed)
      return res.render("session/login", {
        user: req.body,
        error: "Senha incorreta!",
      });

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    return res.render("session/forgot-password", {
      error: "Erro inesperado, tente novamente.",
    });
  }
}

async function forgot(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.render("session/forgot-password", {
        user: req.body,
        error: "Email não encontrado!",
      });

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    return res.render("session/forgot-password", {
      error: "Erro inesperado, tente novamente.",
    });
  }
}

async function reset(req, res, next) {
  try {
    const { email, password, password_repeat, token } = req.body;

    //filled all fields
    if (validationOfBlankForms(req.body)) {
      return res.render("session/password-reset", {
        error: "Por favor, preencha todos os campos do formulário",
        user: req.body,
        token: token,
      });
    }

    console.log(password, password_repeat);

    //check if password match
    if (password !== password_repeat) {
      return res.render("session/password-reset", {
        error: "As senhas não são iguais!",
        user: req.body,
        token: token,
      });
    }
    //procurar o usuário
    const user = await User.findOne({ where: { email } });

    if (!user)
      return res.render("session/password-reset", {
        user: req.body,
        error: "Email não encontrado!",
        token: token,
      });

    //verificar se o token da match
    if (token !== user.reset_token)
      return res.render("session/password-reset", {
        user: req.body,
        error: "Token inválido! Solicite uma nova recuperação de senha.",
        token: token,
      });

    //verificar se o token não expirou
    let now = new Date();
    now = now.setHours(now.getHours());

    if (now > user.reset__token_expires)
      return res.render("session/password-reset", {
        user: req.body,
        token: token,
        error:
          "Token expirado! Por favor, solicite uma nova recuperação de senha.",
      });

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
  }
}
module.exports = {
  login,
  forgot,
  reset,
};
