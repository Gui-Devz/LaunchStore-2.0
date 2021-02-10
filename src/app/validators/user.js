const {
  formatPricing,
  formatPath,
  validationOfBlankForms,
} = require("../../lib/utils");
const User = require("../models/User");

async function post(req, res, next) {
  //check if has all fields
  if (validationOfBlankForms(req.body)) return res.send("Fill all the fields");

  //check if user exists [email, cpf_cnpj]
  let { email, cpf_cnpj, password, passwordRepeat } = req.body;

  cpf_cnpj = cpf_cnpj.replace(/\D/g, "");

  const user = await User.findOne({
    where: { email },
    or: { cpf_cnpj },
  });

  if (user.rows.length > 0) return res.send("User already exists!");

  //check if password match
  if (password !== passwordRepeat) return res.send("Password Mismatch");

  next();
}

module.exports = {
  post,
};
