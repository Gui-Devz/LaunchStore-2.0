const express = require("express");
const multer = require("./app/middlewares/multer");
const productsController = require("./app/controllers/productsController");
const homeController = require("./app/controllers/homeController");
const searchController = require("./app/controllers/searchController");

const routes = express.Router();

routes.get("/", homeController.index);
// Search
routes.get("/products/search", searchController.index);

//Products
routes.get("/products/create", productsController.create);
routes.get("/products/:id", productsController.show);
routes.get("/products/:id/edit", productsController.edit);

routes.post("/products", multer.array("photos", 6), productsController.post);
routes.put("/products", multer.array("photos", 6), productsController.put);
routes.delete("/products", productsController.delete);

// Alias
routes.get("/ads/create", (req, res) => {
  return res.send("olá");
});

module.exports = routes;
