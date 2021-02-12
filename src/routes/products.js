const express = require("express");
const routes = express.Router();
const multer = require("../app/middlewares/multer");

const productsController = require("../app/controllers/productsController");
const searchController = require("../app/controllers/searchController");
const { onlyUsers } = require("../app/middlewares/session");
// Search
routes.get("/search", searchController.index);

//Products
routes.get("/create", onlyUsers, productsController.create);
routes.get("/:id", productsController.show);
routes.get("/:id/edit", productsController.edit);

routes.post("/", multer.array("photos", 6), productsController.post);
routes.put("/", multer.array("photos", 6), productsController.put);
routes.delete("/", productsController.delete);

module.exports = routes;
