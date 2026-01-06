const User = require("../models/User");
const Recipe = require("../models/Recipe");
const { protect } = require("../middleware/auth");

// @desc    Add recipe to favorites
// @route   POST /api/users/favorites/:recipeId
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    // Check if already favorited
    if (user.favoriteRecipes.includes(req.params.recipeId)) {
      return res.status(400).json({
        success: false,
        error: "Recipe already in favorites",
      });
    }

    user.favoriteRecipes.push(req.params.recipeId);
    await user.save();

    await user.populate("favoriteRecipes");

    res.status(200).json({
      success: true,
      data: user.favoriteRecipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Remove recipe from favorites
// @route   DELETE /api/users/favorites/:recipeId
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    user.favoriteRecipes = user.favoriteRecipes.filter(
      (id) => id.toString() !== req.params.recipeId
    );
    await user.save();

    await user.populate("favoriteRecipes");

    res.status(200).json({
      success: true,
      data: user.favoriteRecipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get user's favorite recipes
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "favoriteRecipes",
      populate: {
        path: "ingredients.ingredient",
        select: "name caloriesPer100g proteinPer100g carbsPer100g fatsPer100g",
      },
    });

    // Add per-serving nutritional info
    const favoritesWithNutrition = user.favoriteRecipes.map((recipe) => {
      const recipeObj = recipe.toObject();
      recipeObj.perServing = recipe.perServing;
      return recipeObj;
    });

    res.status(200).json({
      success: true,
      count: favoritesWithNutrition.length,
      data: favoritesWithNutrition,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};






// @desc    Update user body metrics
// @route   PUT /api/users/profile/metrics
// @access  Private
exports.updateMetrics = async (req, res) => {
  try {
    const { age, gender, height, weight, activityLevel, goal } = req.body;

    const user = await User.findById(req.userId);

    // Update metrics fields
    if (!user.metrics) user.metrics = {};
    if (age) user.metrics.age = age;
    if (gender) user.metrics.gender = gender;
    if (height) user.metrics.height = height;
    if (weight) user.metrics.weight = weight;
    if (activityLevel) user.metrics.activityLevel = activityLevel;
    if (goal) user.metrics.goal = goal;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
