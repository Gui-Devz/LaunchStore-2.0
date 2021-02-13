const db = require("../../config/db");
const { hash } = require("bcryptjs");
const fs = require("fs");

const Product = require("../models/Product");

module.exports = {
  async findOne(filters) {
    try {
      let query = "SELECT * FROM users";

      Object.keys(filters).map((key) => {
        //WHERE | OR | AND
        query = `
          ${query}
          ${key}
        `;

        Object.keys(filters[key]).map((field) => {
          query = `${query} ${field} = '${filters[key][field]}'`;
        });
      });
      const result = await db.query(query);

      return result.rows[0];
    } catch (error) {
      console.error(error);
    }
  },

  async create(data) {
    try {
      const query = `
        INSERT INTO users (
          name,
          email,
          password,
          cpf_cnpj,
          cep,
          address    
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      //hash of password
      const passwordHash = await hash(data.password, 8);

      const values = [
        data.name,
        data.email,
        passwordHash,
        data.cpf_cnpj.replace(/\D/g, ""),
        data.cep.replace(/\D/g, ""),
        data.address,
      ];

      const results = await db.query(query, values);

      return results.rows[0].id;
    } catch (error) {
      console.error(error);
    }
  },

  async update(id, fields) {
    try {
      let query = `UPDATE users SET`;

      Object.keys(fields).map(async (key, index, array) => {
        if (index + 1 < array.length) {
          query = `
            ${query}
            ${key} = '${fields[key]}',
          `;
        } else {
          query = `
            ${query}
            ${key} = '${fields[key]}'
            WHERE id = ${id}
          `;
        }
      });

      await db.query(query);

      return;
    } catch (error) {
      console.error(error);
    }
  },

  async delete(id) {
    try {
      //pegar todos os produtos
      let results = await Product.find(id);
      const products = results.rows;

      //pegar todas as imagens
      const allFilesPromise = products.map((product) => {
        Product.findFiles(product.id);
      });

      let promiseResults = await Promise.all(allFilesPromise);

      //rodar a remoção do usuário
      await db.query("DELETE FROM users WHERE id = $1", [id]);

      //remover as imagens da pasta public
      promiseResults.map((result) => {
        results.rows.map((file) => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error(error);
          }
        });
      });
    } catch (error) {
      console.error(error);
    }
  },
};
