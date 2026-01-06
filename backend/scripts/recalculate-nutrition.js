const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Recipe = require("../models/Recipe");

// Load environment variables
dotenv.config();

const recalculateNutrition = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all recipes
    const recipes = await Recipe.find({}).populate("ingredients.ingredient");
    console.log(`📊 Found ${recipes.length} recipes to recalculate`);

    // Recalculate nutrition for each recipe
    for (const recipe of recipes) {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      for (const item of recipe.ingredients) {
        if (item.ingredient) {
          // Convert quantity to grams
          let quantityInGrams = item.quantity;
          
          if (item.unit === "kg") {
            quantityInGrams = item.quantity * 1000;
          } else if (item.unit === "ml" || item.unit === "l") {
            quantityInGrams = item.unit === "l" ? item.quantity * 1000 : item.quantity;
          } else if (item.unit === "cup") {
            quantityInGrams = item.quantity * 240;
          } else if (item.unit === "tbsp") {
            quantityInGrams = item.quantity * 15;
          } else if (item.unit === "tsp") {
            quantityInGrams = item.quantity * 5;
          } else if (item.unit === "piece") {
            const ingredientName = item.ingredient.name?.toLowerCase() || '';
            if (ingredientName.includes('egg')) {
              quantityInGrams = item.quantity * 50;
            } else if (ingredientName.includes('banana')) {
              quantityInGrams = item.quantity * 120;
            } else {
              quantityInGrams = item.quantity * 100;
            }
          } else if (item.unit === "slice") {
            const ingredientName = item.ingredient.name?.toLowerCase() || '';
            if (ingredientName.includes('bread')) {
              quantityInGrams = item.quantity * 25;
            } else {
              quantityInGrams = item.quantity * 20;
            }
          }

          const ratio = quantityInGrams / 100;

          totalCalories += (item.ingredient.caloriesPer100g || 0) * ratio;
          totalProtein += (item.ingredient.proteinPer100g || 0) * ratio;
          totalCarbs += (item.ingredient.carbsPer100g || 0) * ratio;
          totalFats += (item.ingredient.fatsPer100g || 0) * ratio;
        }
      }

      // Update recipe with calculated values
      recipe.totalCalories = Math.round(totalCalories * 100) / 100;
      recipe.totalProtein = Math.round(totalProtein * 100) / 100;
      recipe.totalCarbs = Math.round(totalCarbs * 100) / 100;
      recipe.totalFats = Math.round(totalFats * 100) / 100;

      // Save without triggering pre-save hook (to avoid double calculation)
      await Recipe.findByIdAndUpdate(recipe._id, {
        totalCalories: recipe.totalCalories,
        totalProtein: recipe.totalProtein,
        totalCarbs: recipe.totalCarbs,
        totalFats: recipe.totalFats,
      });

      console.log(`✅ Updated ${recipe.name}: ${recipe.totalCalories.toFixed(0)} cal, ${recipe.totalProtein.toFixed(1)}g protein`);
    }

    console.log("\n🎉 All nutrition values recalculated!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error recalculating nutrition:", error);
    process.exit(1);
  }
};

// Run recalculation
recalculateNutrition();





