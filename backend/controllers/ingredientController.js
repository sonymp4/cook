const Ingredient = require("../models/Ingredient");

// @desc    Get all ingredients
// @route   GET /api/ingredients
// @access  Public
exports.getAllIngredients = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const ingredients = await Ingredient.find(query).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get single ingredient
// @route   GET /api/ingredients/:id
// @access  Public
exports.getIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        error: "Ingredient not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Create ingredient
// @route   POST /api/ingredients
// @access  Public
exports.createIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.create(req.body);
    res.status(201).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Ingredient with this name already exists",
      });
    }
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update ingredient
// @route   PUT /api/ingredients/:id
// @access  Public
exports.updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        error: "Ingredient not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete ingredient
// @route   DELETE /api/ingredients/:id
// @access  Public
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        error: "Ingredient not found",
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




