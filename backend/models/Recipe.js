const mongoose = require("mongoose");

const recipeIngredientSchema = new mongoose.Schema({
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ingredient",
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
  },
  unit: {
    type: String,
    enum: ["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "piece", "slice"],
    default: "g",
  },
});

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Recipe name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    instructions: {
      type: [String],
      required: [true, "Instructions are required"],
    },
    ingredients: {
      type: [recipeIngredientSchema],
      required: [true, "At least one ingredient is required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Recipe must have at least one ingredient",
      },
    },
    servings: {
      type: Number,
      default: 1,
      min: [1, "Servings must be at least 1"],
    },
    prepTime: {
      type: Number, // in minutes
      min: [0, "Prep time cannot be negative"],
    },
    cookTime: {
      type: Number, // in minutes
      min: [0, "Cook time cannot be negative"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    category: {
      type: String,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "dessert",
        "appetizer",
        "beverage",
        "other",
      ],
      default: "other",
    },
    country: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    // Calculated nutritional values (per serving)
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    totalFats: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate nutritional values before saving
recipeSchema.pre("save", async function () {
  if (this.isModified("ingredients") || this.isNew) {
    try {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      // Populate ingredients to get nutritional data
      await this.populate("ingredients.ingredient");

      for (const item of this.ingredients) {
        if (item.ingredient) {
          // Convert quantity to grams
          let quantityInGrams = item.quantity;
          
          if (item.unit === "kg") {
            quantityInGrams = item.quantity * 1000;
          } else if (item.unit === "ml" || item.unit === "l") {
            // For liquids, assume 1ml = 1g (approximation)
            quantityInGrams = item.unit === "l" ? item.quantity * 1000 : item.quantity;
          } else if (item.unit === "cup") {
            quantityInGrams = item.quantity * 240; // Approximate
          } else if (item.unit === "tbsp") {
            quantityInGrams = item.quantity * 15;
          } else if (item.unit === "tsp") {
            quantityInGrams = item.quantity * 5;
          } else if (item.unit === "piece") {
            // Estimate weights for common "piece" items
            const ingredientName = item.ingredient.name?.toLowerCase() || '';
            if (ingredientName.includes('egg')) {
              quantityInGrams = item.quantity * 50; // Average egg ~50g
            } else if (ingredientName.includes('banana')) {
              quantityInGrams = item.quantity * 120; // Average banana ~120g
            } else if (ingredientName.includes('apple')) {
              quantityInGrams = item.quantity * 180; // Average apple ~180g
            } else {
              quantityInGrams = item.quantity * 100; // Default: assume 100g per piece
            }
          } else if (item.unit === "slice") {
            // Estimate weights for slices
            const ingredientName = item.ingredient.name?.toLowerCase() || '';
            if (ingredientName.includes('bread')) {
              quantityInGrams = item.quantity * 25; // Average bread slice ~25g
            } else {
              quantityInGrams = item.quantity * 20; // Default: assume 20g per slice
            }
          }
          // If unit is "g" or undefined, use quantity as-is

          const ratio = quantityInGrams / 100; // Ratio to 100g

          totalCalories += (item.ingredient.caloriesPer100g || 0) * ratio;
          totalProtein += (item.ingredient.proteinPer100g || 0) * ratio;
          totalCarbs += (item.ingredient.carbsPer100g || 0) * ratio;
          totalFats += (item.ingredient.fatsPer100g || 0) * ratio;
        }
      }

      // Store totals (not per serving yet)
      this.totalCalories = Math.round(totalCalories * 100) / 100;
      this.totalProtein = Math.round(totalProtein * 100) / 100;
      this.totalCarbs = Math.round(totalCarbs * 100) / 100;
      this.totalFats = Math.round(totalFats * 100) / 100;
    } catch (error) {
      console.error("Error calculating nutrition:", error);
      // Set defaults on error
      this.totalCalories = 0;
      this.totalProtein = 0;
      this.totalCarbs = 0;
      this.totalFats = 0;
    }
  }
});

// Virtual for per-serving nutritional values
recipeSchema.virtual("perServing").get(function () {
  return {
    calories: Math.round((this.totalCalories / this.servings) * 100) / 100,
    protein: Math.round((this.totalProtein / this.servings) * 100) / 100,
    carbs: Math.round((this.totalCarbs / this.servings) * 100) / 100,
    fats: Math.round((this.totalFats / this.servings) * 100) / 100,
  };
});

module.exports = mongoose.model("Recipe", recipeSchema);


