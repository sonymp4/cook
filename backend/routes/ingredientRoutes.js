const express = require("express");
const router = express.Router();
const {
  getAllIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require("../controllers/ingredientController");

router.route("/").get(getAllIngredients).post(createIngredient);
router
  .route("/:id")
  .get(getIngredient)
  .put(updateIngredient)
  .delete(deleteIngredient);

module.exports = router;



