const crypto = require("crypto");
const User = require("../models/User");

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

  forgot(req, res) {
    const user = req.user;
    // um token para esse usuário
    const token = crypto.randomBytes(20).toString('hex');
  
    //criar uma expiração do token
    let now = new Date();
    now = now.setHours(now.getHours()+1);

    await User.update(user.id,{
      reset_token: token,
      reset_token_expires: now
    })

    //enviar um email com um link de recuperação de senha.

    //avisar o usuário que enviamos o email.

  },
};
