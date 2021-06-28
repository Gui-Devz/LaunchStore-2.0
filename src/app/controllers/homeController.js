const { formatPricing, formatPath } = require("../../lib/utils");
const Product = require("../models/Product");
const File = require("../models/File")

module.exports = {
  async index(req, res) {
    try {
      const products = await Product.findAll();

      if (!products) return res.send("Products not found!");

      async function getImage(productID) {
        let results = await File.loadAllProductFiles(productID);

        const file = formatPath(results.rows, req);

        return file.length != 0 ? file[0].src : null;
      }

      const productsPromises = products.map(async (product) => {
        product.img = await getImage(product.id);
        product.old_price = formatPricing(product.old_price);
        product.price = formatPricing(product.price);

        return product;
      });
      //.filter((product, index) => (index > 2 ? false : true));

      const lastAdded = await Promise.all(productsPromises);

      return res.render("home/index", { products: lastAdded });
    } catch (err) {
      throw new Error(err);
    }
  },
};
