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
    const product = results;

    const { day, month, hours, minutes } = formatBrowser(product.updated_at);

    product.published = {
      day,
      month,
      hours,
      minutes,
    };

    product.price = formatPricing(product.price);
    product.old_price = formatPricing(product.old_price);

    if (!product) return res.send("Product not found!");

    //Getting all the photos of the product
    results = await File.loadAllProductFiles(id);
    let files = results.rows;

    //Formatting the path of the photos to send to the front-end
    files = formatPath(files, req);

    return res.render("products/show", { product, files });
  },

  async create(req, res) {
    try {
      const categories = await Category.findAll();

      return res.render("products/create", { categories });
    } catch (error) {
      console.error(error);
    }
  },

  async post(req, res) {
    try {
      req.body.user_id = req.session.userID;
      let {
        category_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status,
      } = req.body;

      if (validationOfBlankForms(req.body)) {
        return res.render("products/create", {
          error: "Por favor, preencha todos os campos do formulário",
          user: req.body,
        });
      }

      //Validation of quantity of photos sent
      if (req.files.length === 0) {
        const results = await Category.findAll();

        const categories = results.rows[0];

        return res.render("products/create", {
          error: "Por favor, envie ao menos uma imagem!",
          product: req.body,
          categories: categories,
        });
      }

      //Adding new product to database
      const productId = await Product.create({
        category_id,
        user_id: req.session.userID,
        name,
        description,
        old_price: old_price || price.replace(/\D/g, ""),
        price: price.replace(/\D/g, ""),
        quantity,
        status: status || 1,
      });

      //Adding new photos to database
      const imagesPromises = req.files.map((file) => {
        File.create({
          name: file.filename,
          path: file.path,
          product_id: productId.id,
        });
      });

      await Promise.all(imagesPromises);

      return res.redirect(`/products/${productId.id}`);
    } catch (error) {
      console.error(error);
      return res.render("products/create", {
        error: `Ops.... Ocorreu um erro!`,
        user: req.body,
      });
    }
  },

  async edit(req, res) {
    //Getting product
    let results = await Product.find(req.params.id);
    let product = results;

    if (!product) return res.send("product not found!");

    //Getting categories
    const categories = await Category.findAll();

    product.old_price = formatPricing(product.old_price);
    product.price = formatPricing(product.price);

    //Getting photos and formatting their paths
    results = await File.loadAllProductFiles(product.id);
    let photos = results.rows;
    photos = formatPath(photos, req);

    return res.render("products/edit.njk", { product, categories, photos });
  },

  async put(req, res) {
    try {
      req.body.user_id = req.session.userID;
      let {
        category_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status,
      } = req.body;

      if (validationOfBlankForms(req.body)) {
        return res.render("products/edit", {
          error: "Por favor, preencha todos os campos do formulário",
          user: req.body,
        });
      }

      //Updating the old price value
      price = price.replace(/\D/g, "");

      if (old_price != price) {
        const oldProduct = await Product.find(req.body.id);

        old_price = oldProduct.rows[0].price;
      }

      //Updating the photos excluded in the root and database
      if (removed_photos) {
        const files_id = removed_photos.split(",");
        files_id.pop(); // removing the last index (',')

        files_id.forEach(async (id) => {
          const result = await File.find(id);

          const file = result.rows[0];

          //Deleting from Root
          fs.unlinkSync(file.path);

          //Deleting from database
          await File.delete(id);
        });
      }

      //Updating the product and getting it's ID
      const productID = await Product.update(id, {
        category_id,
        name,
        description,
        old_price,
        price,
        quantity,
        status,
      });

      //Updating the photos added in the database
      if (req.files.length != 0) {
        const imagesPromises = req.files.map((file) => {
          try {
            File.create(file.filename, file.path, productID);
          } catch (error) {
            console.error(error);
          }
        });

        await Promise.all(imagesPromises);
      }

      return res.redirect(`/products/${productID}`);
    } catch (error) {
      console.error(error);
      return res.render("products/edit", {
        error: `Ops.... Ocorreu um erro!`,
        user: req.body,
      });
    }
  },

  async delete(req, res) {
    const { id, removed_photos } = req.body;

    //Getting all the photos of this product
    const results = await File.loadAllProductFiles(id);
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
      await File.deleteAllFiles(id);
      await Product.delete(id);

      return res.redirect("/products/create");
    }

    return res.send(
      "Please, delete all the photos before deleting the product!"
    );
  },
};
