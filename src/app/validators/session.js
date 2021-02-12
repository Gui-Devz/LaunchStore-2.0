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

    if (!user.rows[0])
      return res.render("session/login", {
        user: req.body,
        error: "Email não encontrado!",
      });

    const userPassword = user.rows[0].password;

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
  }
}

module.exports = {
  login,
};
