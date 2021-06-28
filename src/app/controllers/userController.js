const User = require("../models/User");
const Product = require("../models/Product");
const File = require("../models/File");

const { formatCpfCnpj, formatCep } = require("../../lib/utils");
const { hash } = require("bcryptjs");
const { unlinkSync } = require("fs");

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
      const user = {
        ...req.body,
        password: await hash(data.password, 8),
        cpf_cnpj: req.body.cpf_cnpj.replace(/\D/g, ""),
        cep: req.body.cep.replace(/\D/g, ""),
      };

      delete user["passwordRepeat"];

      const userID = await User.create(user);

      req.session.userId = userID;

      return res.redirect(`/${userID}`);
    } catch (error) {
      console.error(error);
    }
  },

  async update(req, res) {
    try {
      const { user } = req;
      const userID = user.id;

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

  async delete(req, res) {
    try {
      //pegar todos os produtos
      const products = await Product.find(id);

      //pegar todas as imagens
      const allFilesPromise = products.map((product) => {
        File.loadAllProductFiles(product.id);
      });

      let promiseResults = await Promise.all(allFilesPromise);

      promiseResults.map((results) => {
        results.rows.map((file) => {
          try {
            unlinkSync(file.path);
          } catch (error) {
            console.error(error);
          }
        });
      });

      await User.delete(req.user.id);
      req.session.destroy();

      return res.render("session/login", {
        success: "Conta deletada com sucesso!",
      });
    } catch (error) {
      console.error(error);
      return res.render("user/index", {
        user: req.user,
        error: `Erro ao deletar a sua conta!`,
      });
    }
  },
};
