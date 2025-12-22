const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ingredient name is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    caloriesPer100g: {
      type: Number,
      required: [true, "Calories per 100g is required"],
      min: [0, "Calories cannot be negative"],
    },
    proteinPer100g: {
      type: Number,
      required: [true, "Protein per 100g is required"],
      min: [0, "Protein cannot be negative"],
    },
    carbsPer100g: {
      type: Number,
      default: 0,
      min: [0, "Carbs cannot be negative"],
    },
    fatsPer100g: {
      type: Number,
      default: 0,
      min: [0, "Fats cannot be negative"],
    },
    category: {
      type: String,
      enum: [
        "vegetable",
        "fruit",
        "meat",
        "dairy",
        "grain",
        "spice",
        "oil",
        "other",
      ],
      default: "other",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ingredient", ingredientSchema);



