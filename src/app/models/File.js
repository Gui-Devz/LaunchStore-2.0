const db = require("../../config/db");

module.exports = {
  create(name, path, product_id) {
    const query = `
      INSERT INTO files (
        name,
        path,
        product_id
      ) VALUES ($1,$2,$3)
      RETURNING id
    `;

    const values = [name, path, product_id];

    return db.query(query, values);
  },

  find(id) {
    const query = `
      SELECT * FROM files WHERE id = $1
    `;

    return db.query(query, [id]);
  },

  load(product_id) {
    const query = `
      SELECT*FROM files WHERE product_id = $1
    `;

    return db.query(query, [product_id]);
  },

  deleteOnlyOne(id, files_id) {
    return db.query("DELETE FROM files WHERE id = $1", [id]);
  },
  delete(product_id) {
    return db.query("DELETE FROM files WHERE product_id = $1", [product_id]);
  },
};
