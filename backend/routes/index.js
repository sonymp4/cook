const express = require("express");
const router = express.Router();
const ingredientRoutes = require("./ingredientRoutes");
const recipeRoutes = require("./recipeRoutes");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

// Mount routes
router.use("/ingredients", ingredientRoutes);
router.use("/recipes", recipeRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;




