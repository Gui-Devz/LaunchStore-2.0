const express = require("express");
const routes = express.Router();
const multer = require("../app/middlewares/multer");

const productsController = require("../app/controllers/productsController");
const searchController = require("../app/controllers/searchController");
const { onlyUsers } = require("../app/middlewares/session");
const {
  allowingEditingOfProducts,
  checkBeforeModifyProduct,
} = require("../app/validators/session");

// Search
routes.get("/search", searchController.index);

//Products
routes.get("/create", onlyUsers, productsController.create);
routes.get("/:id", productsController.show);
routes.get("/:id/edit", allowingEditingOfProducts, productsController.edit);

routes.post("/", multer.array("photos", 6), productsController.post);
routes.put(
  "/",
  multer.array("photos", 6),
  checkBeforeModifyProduct,
  productsController.put
);
routes.delete("/", checkBeforeModifyProduct, productsController.delete);

module.exports = routes;
