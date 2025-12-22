const express = require("express");
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

router.get("/favorites", getFavorites);
router.post("/favorites/:recipeId", addFavorite);
router.delete("/favorites/:recipeId", removeFavorite);

module.exports = router;



