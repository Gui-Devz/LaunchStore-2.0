const db = require("../../config/db");

module.exports = {
  all() {
    return db.query(`
      SELECT * FROM products
      ORDER BY updated_at
    `);
  },
  create(dataPut) {
    const query = `
      INSERT INTO products (
        category_id,
        user_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    dataPut.price = dataPut.price.replace(/\D/g, "");

    const values = [
      dataPut.category_id,
      dataPut.user_id || 4,
      dataPut.name,
      dataPut.description,
      dataPut.old_price || dataPut.price,
      dataPut.price,
      dataPut.quantity,
      dataPut.status || 1,
    ];

    return db.query(query, values);
  },

  find(id) {
    const query = `
      SELECT * FROM products WHERE id = $1
    `;

    return db.query(query, [id]);
  },

  findFiles(id) {
    const query = `
      SELECT * FROM files WHERE product_id = $1
    `;

    return db.query(query, [id]);
  },

  update(dataPut) {
    const query = `
      UPDATE products SET
        category_id = $1,
        user_id = $2,
        name = $3,
        description = $4,
        old_price = $5,
        price = $6,
        quantity = $7,
        status = $8
      WHERE products.id = $9
      RETURNING id
    `;

    const values = [
      dataPut.category_id,
      dataPut.user_id || 4,
      dataPut.name,
      dataPut.description,
      dataPut.old_price || dataPut.price,
      dataPut.price,
      dataPut.quantity,
      dataPut.status || 1,
      dataPut.id,
    ];

    return db.query(query, values);
  },

  delete(id) {
    return db.query("DELETE FROM products WHERE id = $1", [id]);
  },

  search(params) {
    const { filter, category } = params;

    let query = "",
      filterQuery = `WHERE`;

    if (category) {
      filterQuery = `
        ${filterQuery}
        products.category_id = ${category}
        AND
      `;
    }

    filterQuery = `
      ${filterQuery}
      products.name ILIKE '%${filter}%'
      OR products.description ILIKE '%${filter}%'
    `;

    query = `
        SELECT products.*, categories.name AS category_name
        FROM products
        LEFT JOIN categories ON (categories.id = products.category_id)
        ${filterQuery}
    `;

    return db.query(query);
  },
};
