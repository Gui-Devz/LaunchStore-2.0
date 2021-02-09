const express = require("express");
const routes = express.Router();

const homeController = require("../app/controllers/homeController");

const users = require("./users");
const products = require("./products");

// HOME
routes.get("/", homeController.index);

routes.use("/products", products);
routes.use("/users", users);

// Alias
routes.get("/ads/create", (req, res) => {
  return res.send("olá");
});

routes.get("/users/register", (req, res) => {
  return res.redirect("/users/register");
});

module.exports = routes;
