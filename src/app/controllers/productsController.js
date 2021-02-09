const {
  formatPricing,
  formatBrowser,
  formatPath,
  validationOfBlankForms,
} = require("../../lib/utils");
const Category = require("../models/Category");
const Product = require("../models/Product");
const File = require("../models/File");
const fs = require("fs");

module.exports = {
  index(req, res) {
    return res.render("layout");
  },

  async show(req, res) {
    const { id } = req.params;

    //Finding the product requested
    let results = await Product.find(id);
    const product = results.rows[0];

    const { day, month, hours, minutes } = formatBrowser(product.updated_at);

    product.published = {
      day,
      month,
      hours,
      minutes,
    };

    product.price = formatPricing(product.price).replace(".", ",");
    product.old_price = formatPricing(product.old_price).replace(".", ",");

    if (!product) return res.send("Product not found!");

    //Getting all the photos of the product
    results = await File.load(id);
    let files = results.rows;

    //Formatting the path of the photos to send to the front-end
    files = formatPath(files, req);

    return res.render("products/show", { product, files });
  },

  create(req, res) {
    //Getting categories
    Category.all()
      .then(function (results) {
        const categories = results.rows;

        return res.render("products/create", { categories });
      })
      .catch(function (err) {
        throw new Error(err);
      });
  },

  async post(req, res) {
    const urlEncoded = req.body;

    validationOfBlankForms(urlEncoded, req, res);

    //Validation of quantity of photos sent
    if (req.files === 0) {
      res.send("Please send at least one image");
    }

    //Adding new product to database
    let results = await Product.create(urlEncoded);
    const productId = results.rows[0].id;

    //Adding new photos to database
    const imagesPromises = req.files.map((file) => {
      File.create(file.filename, file.path, productId);
    });

    await Promise.all(imagesPromises);

    return res.redirect(`/products/${productId}`);
  },

  async edit(req, res) {
    //Getting product
    let results = await Product.find(req.params.id);
    let product = results.rows[0];

    if (!product) return res.send("product not found!");

    //Getting categories
    results = await Category.all();
    const categories = results.rows;

    product.old_price = formatPricing(product.old_price);
    product.price = formatPricing(product.price);

    //Getting photos and formatting their paths
    results = await File.load(product.id);
    let photos = results.rows;
    photos = formatPath(photos, req);

    return res.render("products/edit.njk", { product, categories, photos });
  },

  async put(req, res) {
    const urlEncoded = req.body;

    validationOfBlankForms(urlEncoded, req, res);

    //Updating the old price value
    urlEncoded.price = urlEncoded.price.replace(/\D/g, "");

    if (urlEncoded.old_price != urlEncoded.price) {
      const oldProduct = await Product.find(urlEncoded.id);

      urlEncoded.old_price = oldProduct.rows[0].price;
    }

    //Updating the photos excluded in the root and database
    if (urlEncoded.removed_photos) {
      const files_id = urlEncoded.removed_photos.split(",");
      files_id.pop(); // removing the last index (',')

      files_id.forEach(async (id) => {
        const result = await File.find(id);

        const file = result.rows[0];

        //Deleting from Root
        fs.unlinkSync(file.path);

        //Deleting from database
        await File.deleteOnlyOne(id);
      });
    }

    //Updating the product and getting it's ID
    const results = await Product.update(urlEncoded);
    const productID = results.rows[0].id;

    //Updating the photos added in the database
    if (req.files != 0) {
      const imagesPromises = req.files.map((file) => {
        File.create(file.filename, file.path, productID);
      });

      await Promise.all(imagesPromises);
    }

    return res.redirect(`/products/${productID}`);
  },

  async delete(req, res) {
    const { id, removed_photos } = req.body;

    //Getting all the photos of this product
    const results = await File.load(id);
    const files = results.rows;
    const countingRemovedPhotos = removed_photos.split(",");
    countingRemovedPhotos.pop(); // removing the last index (',')

    if (countingRemovedPhotos.length === files.length) {
      //Getting all the photos of the product
      let arrFiles = [];
      for (const file of files) {
        arrFiles.push(file.name);
      }

      //Deleting photos from server
      arrFiles.forEach((fileName) => {
        const path = `./public/images/${fileName}`;

        fs.unlinkSync(path);
      });

      //Deleting photos and product from database
      await File.delete(id);
      await Product.delete(id);

      return res.redirect("/products/create");
    }

    return res.send(
      "Please, delete all the photos before deleting the product!"
    );
  },
};
