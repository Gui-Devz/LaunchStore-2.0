const {
  formatPricing,
  formatBrowser,
  formatPath,
  validationOfBlankForms,
} = require("../../lib/utils");
const Category = require("../models/Category");
const Product = require("../models/Product");
const File = require("../models/File");

module.exports = {
  async index(req, res) {
    try {
      let results,
        params = {};

      const { filter, category } = req.query;

      if (!filter) return res.redirect("/");

      params.filter = filter;

      if (category) params.category = category;

      results = await Product.search(params);

      async function getImage(productID) {
        let results = await Product.findFiles(productID);

        const file = formatPath(results.rows, req);

        return file.length != 0 ? file[0].src : null;
      }

      const productsPromises = results.rows.map(async (product) => {
        product.img = await getImage(product.id);
        product.old_price = formatPricing(product.old_price);
        product.price = formatPricing(product.price);

        return product;
      });

      const products = await Promise.all(productsPromises);

      const search = {
        term: req.query.filter,
        total: products.length,
      };

      const categories = products
        .map((product) => ({
          id: product.category_id,
          name: product.category_name,
        }))
        .reduce((categoriesFiltered, category) => {
          const found = categoriesFiltered.some(
            (cat) => cat.id === category.id
          );

          if (!found) categoriesFiltered.push(category);

          return categoriesFiltered;
        }, []);

      return res.render("search/index", {
        products,
        search,
        categories,
      });
    } catch (err) {
      console.error(err);
    }
  },
};
