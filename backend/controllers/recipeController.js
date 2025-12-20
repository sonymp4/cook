const Recipe = require("../models/Recipe");

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
exports.getAllRecipes = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      search,
      country,
      minPrepTime,
      maxPrepTime,
      minCookTime,
      maxCookTime,
      minProtein,
      maxProtein,
      minCarbs,
      maxCarbs,
      minFats,
      maxFats,
      minCalories,
      maxCalories,
      ingredient,
    } = req.query;

    let query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Country filter
    if (country) {
      query.country = { $regex: country, $options: "i" };
    }

    // Name search
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Prep time filters
    if (minPrepTime || maxPrepTime) {
      query.prepTime = {};
      if (minPrepTime) query.prepTime.$gte = parseInt(minPrepTime);
      if (maxPrepTime) query.prepTime.$lte = parseInt(maxPrepTime);
    }

    // Cook time filters
    if (minCookTime || maxCookTime) {
      query.cookTime = {};
      if (minCookTime) query.cookTime.$gte = parseInt(minCookTime);
      if (maxCookTime) query.cookTime.$lte = parseInt(maxCookTime);
    }

    // Get all recipes first to filter by nutrition (calculated fields)
    let recipes = await Recipe.find(query)
      .populate("ingredients.ingredient", "name caloriesPer100g proteinPer100g carbsPer100g fatsPer100g")
      .sort({ createdAt: -1 });

    // Filter by nutrition values (per serving)
    if (minProtein || maxProtein || minCarbs || maxCarbs || minFats || maxFats || minCalories || maxCalories) {
      recipes = recipes.filter((recipe) => {
        const perServing = recipe.perServing;
        const calories = perServing?.calories || (recipe.totalCalories / recipe.servings);
        const protein = perServing?.protein || (recipe.totalProtein / recipe.servings);
        const carbs = perServing?.carbs || (recipe.totalCarbs / recipe.servings);
        const fats = perServing?.fats || (recipe.totalFats / recipe.servings);

        if (minCalories && calories < parseFloat(minCalories)) return false;
        if (maxCalories && calories > parseFloat(maxCalories)) return false;
        if (minProtein && protein < parseFloat(minProtein)) return false;
        if (maxProtein && protein > parseFloat(maxProtein)) return false;
        if (minCarbs && carbs < parseFloat(minCarbs)) return false;
        if (maxCarbs && carbs > parseFloat(maxCarbs)) return false;
        if (minFats && fats < parseFloat(minFats)) return false;
        if (maxFats && fats > parseFloat(maxFats)) return false;

        return true;
      });
    }

    // Filter by ingredient
    if (ingredient) {
      const ingredientRegex = new RegExp(ingredient, "i");
      recipes = recipes.filter((recipe) => {
        return recipe.ingredients.some((item) => {
          return item.ingredient && ingredientRegex.test(item.ingredient.name);
        });
      });
    }

    // Add per-serving nutritional info
    const recipesWithNutrition = recipes.map((recipe) => {
      const recipeObj = recipe.toObject();
      recipeObj.perServing = recipe.perServing;
      return recipeObj;
    });

    res.status(200).json({
      success: true,
      count: recipesWithNutrition.length,
      data: recipesWithNutrition,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "ingredients.ingredient",
      "name caloriesPer100g proteinPer100g carbsPer100g fatsPer100g"
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    const recipeObj = recipe.toObject();
    recipeObj.perServing = recipe.perServing;

    res.status(200).json({
      success: true,
      data: recipeObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create recipe
// @route   POST /api/recipes
// @access  Public
exports.createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    await recipe.populate("ingredients.ingredient", "name caloriesPer100g proteinPer100g carbsPer100g fatsPer100g");

    // Trigger save to calculate nutrition
    await recipe.save();

    const recipeObj = recipe.toObject();
    recipeObj.perServing = recipe.perServing;

    res.status(201).json({
      success: true,
      data: recipeObj,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Public
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("ingredients.ingredient", "name caloriesPer100g proteinPer100g carbsPer100g fatsPer100g");

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    // Recalculate nutrition
    await recipe.save();

    const recipeObj = recipe.toObject();
    recipeObj.perServing = recipe.perServing;

    res.status(200).json({
      success: true,
      data: recipeObj,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Public
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Calculate nutrition for a custom ingredient list
// @route   POST /api/recipes/calculate-nutrition
// @access  Public
exports.calculateNutrition = async (req, res) => {
  try {
    const { ingredients, servings = 1 } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Ingredients array is required",
      });
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    for (const item of ingredients) {
      const ingredient = await require("../models/Ingredient").findById(
        item.ingredient
      );

      if (!ingredient) {
        return res.status(404).json({
          success: false,
          error: `Ingredient with id ${item.ingredient} not found`,
        });
      }

      // Convert quantity to grams
      let quantityInGrams = item.quantity || 0;
      if (item.unit === "kg") quantityInGrams = item.quantity * 1000;
      else if (item.unit === "ml" || item.unit === "l") {
        quantityInGrams = item.unit === "l" ? item.quantity * 1000 : item.quantity;
      } else if (item.unit === "cup") quantityInGrams = item.quantity * 240;
      else if (item.unit === "tbsp") quantityInGrams = item.quantity * 15;
      else if (item.unit === "tsp") quantityInGrams = item.quantity * 5;

      const ratio = quantityInGrams / 100;

      totalCalories += ingredient.caloriesPer100g * ratio;
      totalProtein += ingredient.proteinPer100g * ratio;
      totalCarbs += ingredient.carbsPer100g * ratio;
      totalFats += ingredient.fatsPer100g * ratio;
    }

    const total = {
      calories: Math.round(totalCalories * 100) / 100,
      protein: Math.round(totalProtein * 100) / 100,
      carbs: Math.round(totalCarbs * 100) / 100,
      fats: Math.round(totalFats * 100) / 100,
    };

    const perServing = {
      calories: Math.round((totalCalories / servings) * 100) / 100,
      protein: Math.round((totalProtein / servings) * 100) / 100,
      carbs: Math.round((totalCarbs / servings) * 100) / 100,
      fats: Math.round((totalFats / servings) * 100) / 100,
    };

    res.status(200).json({
      success: true,
      data: {
        total,
        perServing,
        servings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


