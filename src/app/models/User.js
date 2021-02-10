const db = require("../../config/db");

module.exports = {
  findOne(filters) {
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

    return db.query(query);
  },
};
