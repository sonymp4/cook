const express = require("express");
const router = express.Router();
const {
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  calculateNutrition,
} = require("../controllers/recipeController");

router.route("/").get(getAllRecipes).post(createRecipe);
router.route("/calculate-nutrition").post(calculateNutrition);
router.route("/:id").get(getRecipe).put(updateRecipe).delete(deleteRecipe);

module.exports = router;


