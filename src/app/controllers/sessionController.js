const crypto = require("crypto");
const User = require("../models/User");
const mailer = require("../../lib/mailer");

module.exports = {
  loginForm(req, res) {
    const { errorMessage } = req;

    console.log(req.errorCreate);
    return res.render("session/login");
  },

  forgotForm(req, res) {
    return res.render("session/forgot-password");
  },

  async login(req, res) {
    // colocar o usuario no req.session
    const userID = req.user.rows[0].id;
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
};
