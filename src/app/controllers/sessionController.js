const crypto = require("crypto");
const User = require("../models/User");
const mailer = require("../../lib/mailer");
const { hash } = require("bcryptjs");

module.exports = {
  loginForm(req, res) {
    return res.render("session/login");
  },

  forgotForm(req, res) {
    return res.render("session/forgot-password");
  },

  async login(req, res) {
    // colocar o usuario no req.session
    const userID = req.user.id;
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

  async forgot(req, res) {
    try {
      const user = req.user;

      // um token para esse usuário
      const token = crypto.randomBytes(20).toString("hex");

      //criar uma expiração do token
      let now = new Date();
      now = now.setHours(now.getHours() + 1);

      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: now,
      });

      //enviar um email com um link de recuperação de senha.
      await mailer.sendMail({
        to: user.email,
        from: "no-reply@launchstore.com.br",
        subject: "Recuperação de senha",
        html: `<h2>Perdeu a chave?</h2>
        <p>Não se preocupe, clique no link abaixo para recuperar a sua senha</p>
        <p>
          <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
            RECUPERAR SENHA
          </a>
        </p>`,
      });

      //avisar o usuário que enviamos o email.
      return res.render("session/forgot-password", {
        success: `Email enviado para recuperação de senha!`,
      });
    } catch (error) {
      console.error(error);
    }
  },

  resetForm(req, res) {
    try {
      const { token } = req.query;

      return res.render("session/password-reset", { token });
    } catch (error) {
      console.error(error);
    }
  },

  async reset(req, res) {
    const { password, token } = req.body;
    try {
      const { user } = req;

      //criar um novo hash de senha
      const newPassword = await hash(password, 8);

      //atualizar o usuário
      await User.update(user.id, {
        password: newPassword,
        reset_token: "",
        reset_token_expires: "",
      });

      //avisar o usuário que ele tem uma nova senha
      return res.render("session/login", {
        user: req.body,
        success: "Senha atualizada!",
      });
    } catch (error) {
      console.error(error);
      return res.render("session/forgot-password", {
        error: "Erro inesperado, tente novamente.",
        user: req.body,
        token: token,
      });
    }
  },
};
