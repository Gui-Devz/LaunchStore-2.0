const db = require("../../config/db");

function find(filters, table) {
  let query = `SELECT * FROM ${table}`;

  if (filters) {
    Object.keys(filters).map((key) => {
      //WHERE | OR | AND | ORDER BY
      query += ` ${key}`;

      Object.keys(filters[key]).map((field) => {
        query += ` ${field} = '${filters[key][field]}'`;
      });
    });
  }
  // console.log(query);
  return db.query(query);
}

const Base = {
  init({ table }) {
    if (!table) throw new Error("Invalid Params");

    this.table = table;

    return this;
  },

  async find(id) {
    try {
      const results = await find({ where: { id } }, this.table);

      return results.rows[0];
    } catch (error) {
      console.error(error);
    }
  },
  async findOne(filters) {
    try {
      const results = await find(filters, this.table);

      return results.rows[0];
    } catch (error) {
      console.error(error);
    }
  },

  async findAll() {
    try {
      const results = await find(null, this.table);

      return results.rows;
    } catch (error) {
      console.error(error);
    }
  },

  async create(fields) {
    try {
      let keys = "",
        values = "";

      keys = Object.keys(fields).join(",");
      values = Object.values(fields)
        .map((value) => `'${value}'`)
        .join(",");

      const query = `
      INSERT INTO ${this.table} (${keys})
      VALUES (${values})
      RETURNING id
      `;

      console.log(query);
      const results = await db.query(query);

      return results.rows[0];
    } catch (error) {
      console.error(error);
    }
  },

  async update(id, fields) {
    try {
      keys = Object.keys(fields).join(",");
      values = Object.values(fields).join(",");

      const query = `
        UPDATE ${this.table} SET (${keys}) = (${values})
        WHERE id = ${fields[id]};
        RETURNING id
      `;

      /* let update = [];

      Object.keys(fields).map((key) => {

        //category_id= $1,
        const line = `${key} = '${fields[key]}'`;
        update.push(line)

      });

      const query = `
        UPDATE ${this.table} SET ${update.join(',')}
        WHERE id = ${fields['id']};

      ` */

      const results = await db.query(query);
      return results.rows[0];
    } catch (error) {
      console.error(error);
    }
  },

  delete(id) {
    try {
      return db.query(`DELETE FROM ${this.table} WHERE id = $1`, [id]);
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = Base;
