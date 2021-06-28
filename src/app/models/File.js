const db = require("../../config/db");

const Base = require('./Base');

Base.init({table: 'files'})

module.exports = {
  ...Base,
  loadAllProductFiles(product_id) {
    const query = `
      SELECT*FROM files WHERE product_id = $1
    `;

    return db.query(query, [product_id]);
  },
  deleteAllFiles(product_id) {
    return db.query("DELETE FROM files WHERE product_id = $1", [product_id]);
  },
};
