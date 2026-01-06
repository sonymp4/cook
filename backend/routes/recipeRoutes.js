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

const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

router.route("/").get(getAllRecipes).post(protect, admin, createRecipe);
router.route("/calculate-nutrition").post(calculateNutrition);
router.route("/:id").get(getRecipe).put(protect, admin, updateRecipe).delete(protect, admin, deleteRecipe);

module.exports = router;





