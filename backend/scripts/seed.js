const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Ingredient = require("../models/Ingredient");
const Recipe = require("../models/Recipe");

// Load environment variables
dotenv.config();

// Sample ingredients data
const sampleIngredients = [
  {
    name: "chicken breast",
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatsPer100g: 3.6,
    category: "meat",
  },
  {
    name: "brown rice",
    caloriesPer100g: 111,
    proteinPer100g: 2.6,
    carbsPer100g: 23,
    fatsPer100g: 0.9,
    category: "grain",
  },
  {
    name: "broccoli",
    caloriesPer100g: 34,
    proteinPer100g: 2.8,
    carbsPer100g: 7,
    fatsPer100g: 0.4,
    category: "vegetable",
  },
  {
    name: "olive oil",
    caloriesPer100g: 884,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatsPer100g: 100,
    category: "oil",
  },
  {
    name: "salmon",
    caloriesPer100g: 208,
    proteinPer100g: 20,
    carbsPer100g: 0,
    fatsPer100g: 13,
    category: "meat",
  },
  {
    name: "sweet potato",
    caloriesPer100g: 86,
    proteinPer100g: 1.6,
    carbsPer100g: 20,
    fatsPer100g: 0.1,
    category: "vegetable",
  },
  {
    name: "eggs",
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatsPer100g: 11,
    category: "dairy",
  },
  {
    name: "banana",
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23,
    fatsPer100g: 0.3,
    category: "fruit",
  },
  {
    name: "oatmeal",
    caloriesPer100g: 68,
    proteinPer100g: 2.4,
    carbsPer100g: 12,
    fatsPer100g: 1.4,
    category: "grain",
  },
  {
    name: "almonds",
    caloriesPer100g: 579,
    proteinPer100g: 21,
    carbsPer100g: 22,
    fatsPer100g: 50,
    category: "other",
  },
  {
    name: "tomato",
    caloriesPer100g: 18,
    proteinPer100g: 0.9,
    carbsPer100g: 3.9,
    fatsPer100g: 0.2,
    category: "vegetable",
  },
  {
    name: "onion",
    caloriesPer100g: 40,
    proteinPer100g: 1.1,
    carbsPer100g: 9.3,
    fatsPer100g: 0.1,
    category: "vegetable",
  },
  {
    name: "garlic",
    caloriesPer100g: 149,
    proteinPer100g: 6.4,
    carbsPer100g: 33,
    fatsPer100g: 0.5,
    category: "spice",
  },
  {
    name: "milk",
    caloriesPer100g: 42,
    proteinPer100g: 3.4,
    carbsPer100g: 5,
    fatsPer100g: 1,
    category: "dairy",
  },
  {
    name: "whole wheat bread",
    caloriesPer100g: 247,
    proteinPer100g: 13,
    carbsPer100g: 41,
    fatsPer100g: 4.2,
    category: "grain",
  },
  {
    name: "pasta",
    caloriesPer100g: 131,
    proteinPer100g: 5,
    carbsPer100g: 25,
    fatsPer100g: 1.1,
    category: "grain",
  },
  {
    name: "ground beef",
    caloriesPer100g: 250,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatsPer100g: 17,
    category: "meat",
  },
  {
    name: "bell pepper",
    caloriesPer100g: 31,
    proteinPer100g: 1,
    carbsPer100g: 7,
    fatsPer100g: 0.3,
    category: "vegetable",
  },
  {
    name: "mushrooms",
    caloriesPer100g: 22,
    proteinPer100g: 3.1,
    carbsPer100g: 3.3,
    fatsPer100g: 0.3,
    category: "vegetable",
  },
  {
    name: "spinach",
    caloriesPer100g: 23,
    proteinPer100g: 2.9,
    carbsPer100g: 3.6,
    fatsPer100g: 0.4,
    category: "vegetable",
  },
  {
    name: "cheese",
    caloriesPer100g: 402,
    proteinPer100g: 25,
    carbsPer100g: 1.3,
    fatsPer100g: 33,
    category: "dairy",
  },
  {
    name: "butter",
    caloriesPer100g: 717,
    proteinPer100g: 0.9,
    carbsPer100g: 0.1,
    fatsPer100g: 81,
    category: "dairy",
  },
  {
    name: "flour",
    caloriesPer100g: 364,
    proteinPer100g: 10,
    carbsPer100g: 76,
    fatsPer100g: 1,
    category: "grain",
  },
  {
    name: "coconut milk",
    caloriesPer100g: 230,
    proteinPer100g: 2.3,
    carbsPer100g: 6,
    fatsPer100g: 24,
    category: "other",
  },
  {
    name: "ginger",
    caloriesPer100g: 80,
    proteinPer100g: 1.8,
    carbsPer100g: 18,
    fatsPer100g: 0.8,
    category: "spice",
  },
  {
    name: "turmeric",
    caloriesPer100g: 354,
    proteinPer100g: 7.8,
    carbsPer100g: 65,
    fatsPer100g: 9.9,
    category: "spice",
  },
  {
    name: "chili pepper",
    caloriesPer100g: 40,
    proteinPer100g: 1.9,
    carbsPer100g: 9,
    fatsPer100g: 0.4,
    category: "spice",
  },
  {
    name: "pork",
    caloriesPer100g: 242,
    proteinPer100g: 27,
    carbsPer100g: 0,
    fatsPer100g: 14,
    category: "meat",
  },
  {
    name: "lamb",
    caloriesPer100g: 294,
    proteinPer100g: 25,
    carbsPer100g: 0,
    fatsPer100g: 21,
    category: "meat",
  },
  {
    name: "duck",
    caloriesPer100g: 337,
    proteinPer100g: 19,
    carbsPer100g: 0,
    fatsPer100g: 28,
    category: "meat",
  },
  {
    name: "black beans",
    caloriesPer100g: 132,
    proteinPer100g: 8.9,
    carbsPer100g: 24,
    fatsPer100g: 0.5,
    category: "other",
  },
  {
    name: "eggplant",
    caloriesPer100g: 25,
    proteinPer100g: 1,
    carbsPer100g: 6,
    fatsPer100g: 0.2,
    category: "vegetable",
  },
  {
    name: "zucchini",
    caloriesPer100g: 17,
    proteinPer100g: 1.2,
    carbsPer100g: 3.1,
    fatsPer100g: 0.3,
    category: "vegetable",
  },
  {
    name: "potato",
    caloriesPer100g: 77,
    proteinPer100g: 2,
    carbsPer100g: 17,
    fatsPer100g: 0.1,
    category: "vegetable",
  },
  {
    name: "carrot",
    caloriesPer100g: 41,
    proteinPer100g: 0.9,
    carbsPer100g: 10,
    fatsPer100g: 0.2,
    category: "vegetable",
  },
  {
    name: "cucumber",
    caloriesPer100g: 16,
    proteinPer100g: 0.7,
    carbsPer100g: 4,
    fatsPer100g: 0.1,
    category: "vegetable",
  },
  {
    name: "lemon",
    caloriesPer100g: 29,
    proteinPer100g: 1.1,
    carbsPer100g: 9,
    fatsPer100g: 0.3,
    category: "fruit",
  },
  {
    name: "lime",
    caloriesPer100g: 30,
    proteinPer100g: 0.7,
    carbsPer100g: 11,
    fatsPer100g: 0.2,
    category: "fruit",
  },
  {
    name: "coriander",
    caloriesPer100g: 23,
    proteinPer100g: 2.1,
    carbsPer100g: 3.7,
    fatsPer100g: 0.5,
    category: "spice",
  },
  {
    name: "cumin",
    caloriesPer100g: 375,
    proteinPer100g: 17.8,
    carbsPer100g: 44,
    fatsPer100g: 22.3,
    category: "spice",
  },
  {
    name: "paprika",
    caloriesPer100g: 282,
    proteinPer100g: 14.1,
    carbsPer100g: 54,
    fatsPer100g: 12.9,
    category: "spice",
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing data...");
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    console.log("✅ Database cleared");

    // Insert ingredients
    console.log("🌱 Seeding ingredients...");
    const ingredients = await Ingredient.insertMany(sampleIngredients);
    console.log(`✅ Inserted ${ingredients.length} ingredients`);

    // Create sample recipes
    console.log("🌱 Seeding recipes...");

    // Find ingredient IDs
    const chickenBreast = ingredients.find((i) => i.name === "chicken breast");
    const brownRice = ingredients.find((i) => i.name === "brown rice");
    const broccoli = ingredients.find((i) => i.name === "broccoli");
    const oliveOil = ingredients.find((i) => i.name === "olive oil");
    const salmon = ingredients.find((i) => i.name === "salmon");
    const sweetPotato = ingredients.find((i) => i.name === "sweet potato");
    const eggs = ingredients.find((i) => i.name === "eggs");
    const banana = ingredients.find((i) => i.name === "banana");
    const oatmeal = ingredients.find((i) => i.name === "oatmeal");
    const tomato = ingredients.find((i) => i.name === "tomato");
    const onion = ingredients.find((i) => i.name === "onion");
    const garlic = ingredients.find((i) => i.name === "garlic");
    const pasta = ingredients.find((i) => i.name === "pasta");
    const groundBeef = ingredients.find((i) => i.name === "ground beef");
    const bellPepper = ingredients.find((i) => i.name === "bell pepper");
    const mushrooms = ingredients.find((i) => i.name === "mushrooms");
    const spinach = ingredients.find((i) => i.name === "spinach");
    const cheese = ingredients.find((i) => i.name === "cheese");
    const butter = ingredients.find((i) => i.name === "butter");
    const flour = ingredients.find((i) => i.name === "flour");
    const coconutMilk = ingredients.find((i) => i.name === "coconut milk");
    const ginger = ingredients.find((i) => i.name === "ginger");
    const turmeric = ingredients.find((i) => i.name === "turmeric");
    const chiliPepper = ingredients.find((i) => i.name === "chili pepper");
    const pork = ingredients.find((i) => i.name === "pork");
    const lamb = ingredients.find((i) => i.name === "lamb");
    const duck = ingredients.find((i) => i.name === "duck");
    const blackBeans = ingredients.find((i) => i.name === "black beans");
    const eggplant = ingredients.find((i) => i.name === "eggplant");
    const zucchini = ingredients.find((i) => i.name === "zucchini");
    const potato = ingredients.find((i) => i.name === "potato");
    const carrot = ingredients.find((i) => i.name === "carrot");
    const cucumber = ingredients.find((i) => i.name === "cucumber");
    const lemon = ingredients.find((i) => i.name === "lemon");
    const lime = ingredients.find((i) => i.name === "lime");
    const coriander = ingredients.find((i) => i.name === "coriander");
    const cumin = ingredients.find((i) => i.name === "cumin");
    const paprika = ingredients.find((i) => i.name === "paprika");
    const wholeWheatBread = ingredients.find((i) => i.name === "whole wheat bread");
    const milk = ingredients.find((i) => i.name === "milk");
    const sampleRecipes = [
      {
        name: "Grilled Chicken with Rice and Broccoli",
        description: "A healthy and balanced meal perfect for dinner",
        instructions: [
          "Season chicken breast with salt and pepper",
          "Grill chicken for 6-7 minutes per side until cooked through",
          "Cook brown rice according to package instructions",
          "Steam broccoli for 5 minutes until tender",
          "Serve chicken with rice and broccoli, drizzle with olive oil",
        ],
        ingredients: [
          { ingredient: chickenBreast._id, quantity: 200, unit: "g" },
          { ingredient: brownRice._id, quantity: 150, unit: "g" },
          { ingredient: broccoli._id, quantity: 200, unit: "g" },
          { ingredient: oliveOil._id, quantity: 1, unit: "tbsp" },
        ],
        servings: 1,
        prepTime: 10,
        cookTime: 25,
        difficulty: "easy",
        category: "dinner",
        country: "International",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      },
      {
        name: "Baked Salmon with Sweet Potato",
        description: "Omega-3 rich meal with complex carbs",
        instructions: [
          "Preheat oven to 400°F (200°C)",
          "Season salmon fillet with salt, pepper, and herbs",
          "Bake salmon for 12-15 minutes",
          "Bake sweet potato for 45 minutes until soft",
          "Serve together with a side of vegetables",
        ],
        ingredients: [
          { ingredient: salmon._id, quantity: 150, unit: "g" },
          { ingredient: sweetPotato._id, quantity: 200, unit: "g" },
          { ingredient: oliveOil._id, quantity: 1, unit: "tsp" },
        ],
        servings: 1,
        prepTime: 5,
        cookTime: 45,
        difficulty: "easy",
        category: "dinner",
        country: "International",
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800",
      },
      {
        name: "Scrambled Eggs with Toast",
        description: "Quick and protein-packed breakfast",
        instructions: [
          "Heat pan with a bit of olive oil",
          "Crack eggs into a bowl and whisk",
          "Scramble eggs in the pan until cooked",
          "Toast whole wheat bread",
          "Serve eggs with toast",
        ],
        ingredients: [
          { ingredient: eggs._id, quantity: 2, unit: "piece" },
          { ingredient: wholeWheatBread._id, quantity: 2, unit: "slice" },
          { ingredient: oliveOil._id, quantity: 1, unit: "tsp" },
        ],
        servings: 1,
        prepTime: 5,
        cookTime: 10,
        difficulty: "easy",
        category: "breakfast",
        country: "International",
        imageUrl: "https://images.unsplash.com/photo-pRz5RXxWwYU?w=800",
      },
      {
        name: "Banana Oatmeal Bowl",
        description: "Healthy and filling breakfast option",
        instructions: [
          "Cook oatmeal according to package instructions",
          "Slice banana and add to oatmeal",
          "Optional: Add a drizzle of honey or nuts",
          "Serve warm",
        ],
        ingredients: [
          { ingredient: oatmeal._id, quantity: 50, unit: "g" },
          { ingredient: banana._id, quantity: 1, unit: "piece" },
          { ingredient: milk._id, quantity: 200, unit: "ml" },
        ],
        servings: 1,
        prepTime: 2,
        cookTime: 5,
        difficulty: "easy",
        category: "breakfast",
        country: "International",
        imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800",
      },
      {
        name: "Italian Spaghetti Carbonara",
        description: "Classic Italian pasta dish with creamy sauce",
        instructions: [
          "Cook pasta according to package instructions",
          "Cook ground beef until browned",
          "Mix eggs and cheese in a bowl",
          "Combine pasta with beef, add egg mixture off heat",
          "Toss quickly to create creamy sauce",
          "Serve immediately with black pepper",
        ],
        ingredients: [
          { ingredient: pasta._id, quantity: 200, unit: "g" },
          { ingredient: groundBeef._id, quantity: 150, unit: "g" },
          { ingredient: eggs._id, quantity: 2, unit: "piece" },
          { ingredient: cheese._id, quantity: 50, unit: "g" },
          { ingredient: oliveOil._id, quantity: 1, unit: "tbsp" },
        ],
        servings: 2,
        prepTime: 10,
        cookTime: 20,
        difficulty: "medium",
        category: "dinner",
        country: "Italy",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
      },
      {
        name: "Mexican Beef Tacos",
        description: "Traditional Mexican tacos with seasoned beef",
        instructions: [
          "Cook ground beef with onions and garlic",
          "Add spices and seasonings",
          "Warm tortillas",
          "Fill with beef mixture",
          "Top with tomatoes and cheese",
          "Serve with lime wedges",
        ],
        ingredients: [
          { ingredient: groundBeef._id, quantity: 200, unit: "g" },
          { ingredient: onion._id, quantity: 100, unit: "g" },
          { ingredient: garlic._id, quantity: 10, unit: "g" },
          { ingredient: tomato._id, quantity: 150, unit: "g" },
          { ingredient: cheese._id, quantity: 50, unit: "g" },
          { ingredient: oliveOil._id, quantity: 1, unit: "tbsp" },
        ],
        servings: 3,
        prepTime: 15,
        cookTime: 20,
        difficulty: "easy",
        category: "dinner",
        country: "Mexico",
        imageUrl: "https://images.unsplash.com/photo-1565299585323-38174c0b5b14?w=800",
      },
      {
        name: "Japanese Teriyaki Chicken",
        description: "Sweet and savory Japanese-style chicken",
        instructions: [
          "Marinate chicken in teriyaki sauce",
          "Cook chicken in pan until golden",
          "Add sauce and simmer",
          "Serve over rice with vegetables",
          "Garnish with sesame seeds",
        ],
        ingredients: [
          { ingredient: chickenBreast._id, quantity: 200, unit: "g" },
          { ingredient: brownRice._id, quantity: 150, unit: "g" },
          { ingredient: broccoli._id, quantity: 150, unit: "g" },
          { ingredient: oliveOil._id, quantity: 1, unit: "tbsp" },
        ],
        servings: 2,
        prepTime: 10,
        cookTime: 25,
        difficulty: "medium",
        category: "dinner",
        country: "Japan",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
      },
      {
        name: "Indian Chicken Curry",
        description: "Aromatic Indian curry with spices",
        instructions: [
          "Heat oil and sauté onions until golden",
          "Add garlic, ginger, and spices",
          "Add chicken and cook until sealed",
          "Add coconut milk and simmer",
          "Cook until chicken is tender",
          "Serve with rice",
        ],
        ingredients: [
          { ingredient: chickenBreast._id, quantity: 250, unit: "g" },
          { ingredient: onion._id, quantity: 150, unit: "g" },
          { ingredient: garlic._id, quantity: 15, unit: "g" },
          { ingredient: ginger._id, quantity: 20, unit: "g" },
          { ingredient: coconutMilk._id, quantity: 200, unit: "ml" },
          { ingredient: turmeric._id, quantity: 5, unit: "g" },
          { ingredient: chiliPepper._id, quantity: 10, unit: "g" },
          { ingredient: brownRice._id, quantity: 150, unit: "g" },
        ],
        servings: 3,
        prepTime: 15,
        cookTime: 35,
        difficulty: "medium",
        category: "dinner",
        country: "India",
        imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800",
      },
      {
        name: "French Ratatouille",
        description: "Classic French vegetable stew",
        instructions: [
          "Sauté onions and garlic",
          "Add bell peppers and cook",
          "Add tomatoes and simmer",
          "Add eggplant and zucchini",
          "Season with herbs",
          "Cook until vegetables are tender",
        ],
        ingredients: [
          { ingredient: tomato._id, quantity: 300, unit: "g" },
          { ingredient: bellPepper._id, quantity: 200, unit: "g" },
          { ingredient: onion._id, quantity: 150, unit: "g" },
          { ingredient: garlic._id, quantity: 10, unit: "g" },
          { ingredient: oliveOil._id, quantity: 2, unit: "tbsp" },
        ],
        servings: 4,
        prepTime: 20,
        cookTime: 40,
        difficulty: "medium",
        category: "dinner",
        country: "France",
        imageUrl: "https://source.unsplash.com/800x600/?ratatouille,french,vegetables",
      },
      {
        name: "Thai Pad Thai Noodles",
        description: "Stir-fried rice noodles with vegetables",
        instructions: [
          "Soak rice noodles in warm water",
          "Heat oil in wok",
          "Add garlic and cook",
          "Add noodles and vegetables",
          "Stir-fry until cooked",
          "Add sauce and toss",
          "Serve with lime and peanuts",
        ],
        ingredients: [
          { ingredient: pasta._id, quantity: 200, unit: "g" },
          { ingredient: eggs._id, quantity: 2, unit: "piece" },
          { ingredient: bellPepper._id, quantity: 100, unit: "g" },
          { ingredient: onion._id, quantity: 100, unit: "g" },
          { ingredient: oliveOil._id, quantity: 2, unit: "tbsp" },
        ],
        servings: 2,
        prepTime: 15,
        cookTime: 15,
        difficulty: "medium",
        category: "dinner",
        country: "Thailand",
        imageUrl: "https://images.unsplash.com/photo-ev46iKW6GHU?w=800",
      },
      {
        name: "Spanish Paella",
        description: "Traditional Spanish rice dish",
        instructions: [
          "Heat oil in large pan",
          "Sauté onions and bell peppers",
          "Add rice and toast",
          "Add broth and simmer",
          "Add chicken and cook",
          "Add vegetables",
          "Cook until rice is tender",
        ],
        ingredients: [
          { ingredient: brownRice._id, quantity: 200, unit: "g" },
          { ingredient: chickenBreast._id, quantity: 150, unit: "g" },
          { ingredient: bellPepper._id, quantity: 150, unit: "g" },
          { ingredient: tomato._id, quantity: 200, unit: "g" },
          { ingredient: onion._id, quantity: 100, unit: "g" },
          { ingredient: oliveOil._id, quantity: 2, unit: "tbsp" },
        ],
        servings: 4,
        prepTime: 20,
        cookTime: 45,
        difficulty: "hard",
        category: "dinner",
        country: "Spain",
        imageUrl: "https://images.unsplash.com/photo-SM37K0nMrXg?w=800",
      },
      {
        name: "American Classic Burger",
        description: "Juicy beef burger with all the fixings",
        instructions: [
          "Form ground beef into patties",
          "Season with salt and pepper",
          "Cook patties on grill or pan",
          "Toast burger buns",
          "Assemble with cheese, tomatoes, and onions",
          "Serve with fries",
        ],
        ingredients: [
          { ingredient: groundBeef._id, quantity: 200, unit: "g" },
          { ingredient: wholeWheatBread._id, quantity: 2, unit: "slice" },
          { ingredient: cheese._id, quantity: 50, unit: "g" },
          { ingredient: tomato._id, quantity: 50, unit: "g" },
          { ingredient: onion._id, quantity: 30, unit: "g" },
        ],
        servings: 1,
        prepTime: 10,
        cookTime: 15,
        difficulty: "easy",
        category: "lunch",
        country: "United States",
        imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800",
      },
      {
        name: "Korean Kimchi Fried Rice",
        description: "Spicy Korean fried rice with kimchi",
        instructions: [
          "Heat oil in pan",
          "Add garlic and cook",
          "Add rice and break up",
          "Add kimchi and stir-fry",
          "Push rice aside, add eggs",
          "Scramble eggs and mix with rice",
          "Season and serve",
        ],
        ingredients: [
          { ingredient: brownRice._id, quantity: 200, unit: "g" },
          { ingredient: eggs._id, quantity: 2, unit: "piece" },
          { ingredient: garlic._id, quantity: 10, unit: "g" },
          { ingredient: oliveOil._id, quantity: 1, unit: "tbsp" },
        ],
        servings: 2,
        prepTime: 5,
        cookTime: 15,
        difficulty: "easy",
        category: "lunch",
        country: "South Korea",
        imageUrl: "https://source.unsplash.com/800x600/?kimchi,fried,rice",
      },
      {
        name: "Chinese Peking Duck",
        description: "Crispy duck with hoisin sauce - a Chinese delicacy",
        instructions: [
          "Marinate duck with spices",
          "Roast duck until skin is crispy",
          "Prepare hoisin sauce",
          "Slice duck thinly",
          "Serve with pancakes and scallions",
        ],
        ingredients: [
          { ingredient: duck._id, quantity: 300, unit: "g" },
          { ingredient: flour._id, quantity: 100, unit: "g" },
          { ingredient: onion._id, quantity: 50, unit: "g" },
          { ingredient: oliveOil._id, quantity: 2, unit: "tbsp" },
        ],
        servings: 3,
        prepTime: 30,
        cookTime: 90,
        difficulty: "hard",
        category: "dinner",
        country: "China",
        imageUrl: "https://source.unsplash.com/800x600/?peking,duck,chinese",
      },
      {
        name: "Brazilian Feijoada",
        description: "Traditional Brazilian black bean stew",
        instructions: [
          "Soak black beans overnight",
          "Cook beans until tender",
          "Add pork and sausage",
          "Simmer for 2 hours",
          "Serve with rice and orange slices",
        ],
        ingredients: [
          { ingredient: blackBeans._id, quantity: 300, unit: "g" },
          { ingredient: pork._id, quantity: 200, unit: "g" },
          { ingredient: onion._id, quantity: 150, unit: "g" },
          { ingredient: garlic._id, quantity: 15, unit: "g" },
          { ingredient: brownRice._id, quantity: 200, unit: "g" },
        ],
        servings: 4,
        prepTime: 20,
        cookTime: 120,
        difficulty: "hard",
        category: "dinner",
        country: "Brazil",
        imageUrl: "https://source.unsplash.com/800x600/?feijoada,brazilian,food",
      },
      {
        name: "French Coq au Vin",
        description: "Classic French chicken braised in red wine",
        instructions: [
          "Marinate chicken in wine",
          "Brown chicken pieces",
          "Add mushrooms and onions",
          "Add wine and broth",
          "Simmer until tender",
          "Serve with crusty bread",
        ],
        ingredients: [
          { ingredient: chickenBreast._id, quantity: 300, unit: "g" },
          { ingredient: mushrooms._id, quantity: 200, unit: "g" },
          { ingredient: onion._id, quantity: 150, unit: "g" },
          { ingredient: garlic._id, quantity: 10, unit: "g" },
          { ingredient: butter._id, quantity: 30, unit: "g" },
        ],
        servings: 3,
        prepTime: 20,
        cookTime: 60,
        difficulty: "medium",
        category: "dinner",
        country: "France",
        imageUrl: "https://source.unsplash.com/800x600/?coq,au,vin,french",
      },
      {
        name: "Greek Moussaka",
        description: "Layered eggplant and lamb casserole",
        instructions: [
          "Slice and fry eggplant",
          "Cook lamb with onions",
          "Layer eggplant and lamb",
          "Top with béchamel sauce",
          "Bake until golden",
        ],
        ingredients: [
          { ingredient: eggplant._id, quantity: 400, unit: "g" },
          { ingredient: lamb._id, quantity: 300, unit: "g" },
          { ingredient: onion._id, quantity: 150, unit: "g" },
          { ingredient: tomato._id, quantity: 200, unit: "g" },
          { ingredient: cheese._id, quantity: 100, unit: "g" },
          { ingredient: oliveOil._id, quantity: 3, unit: "tbsp" },
        ],
        servings: 6,
        prepTime: 30,
        cookTime: 60,
        difficulty: "hard",
        category: "dinner",
        country: "Greece",
        imageUrl: "https://source.unsplash.com/800x600/?moussaka,greek",
      },
      {
        name: "Vietnamese Pho",
        description: "Traditional Vietnamese noodle soup",
        instructions: [
          "Simmer beef bones for broth",
          "Add spices and aromatics",
          "Cook rice noodles",
          "Slice beef thinly",
          "Assemble with herbs and lime",
        ],
        ingredients: [
          { ingredient: pasta._id, quantity: 200, unit: "g" },
          { ingredient: groundBeef._id, quantity: 150, unit: "g" },
          { ingredient: onion._id, quantity: 100, unit: "g" },
          { ingredient: ginger._id, quantity: 20, unit: "g" },
          { ingredient: lime._id, quantity: 1, unit: "piece" },
        ],
        servings: 2,
        prepTime: 15,
        cookTime: 90,
        difficulty: "medium",
        category: "lunch",
        country: "Vietnam",
        imageUrl: "https://source.unsplash.com/800x600/?pho,vietnamese,soup",
      },
      {
        name: "Indonesian Beef Rendang",
        description: "Slow-cooked beef in coconut and spices",
        instructions: [
          "Marinate beef with spices",
          "Cook in coconut milk",
          "Simmer until liquid reduces",
          "Cook until beef is tender",
          "Serve with steamed rice",
        ],
        ingredients: [
          { ingredient: groundBeef._id, quantity: 400, unit: "g" },
          { ingredient: coconutMilk._id, quantity: 400, unit: "ml" },
          { ingredient: ginger._id, quantity: 30, unit: "g" },
          { ingredient: turmeric._id, quantity: 10, unit: "g" },
          { ingredient: chiliPepper._id, quantity: 15, unit: "g" },
          { ingredient: brownRice._id, quantity: 200, unit: "g" },
        ],
        servings: 4,
        prepTime: 20,
        cookTime: 120,
        difficulty: "hard",
        category: "dinner",
        country: "Indonesia",
        imageUrl: "https://source.unsplash.com/800x600/?rendang,indonesian,beef",
      },
      {
        name: "British Shepherd's Pie",
        description: "Comforting minced lamb with mashed potatoes",
        instructions: [
          "Cook lamb with vegetables",
          "Make mashed potatoes",
          "Layer lamb in baking dish",
          "Top with mashed potatoes",
          "Bake until golden",
        ],
        ingredients: [
          { ingredient: lamb._id, quantity: 300, unit: "g" },
          { ingredient: potato._id, quantity: 500, unit: "g" },
          { ingredient: onion._id, quantity: 150, unit: "g" },
          { ingredient: carrot._id, quantity: 200, unit: "g" },
          { ingredient: butter._id, quantity: 50, unit: "g" },
        ],
        servings: 4,
        prepTime: 25,
        cookTime: 45,
        difficulty: "medium",
        category: "dinner",
        country: "United Kingdom",
        imageUrl: "https://source.unsplash.com/800x600/?shepherds,pie,british",
      },
      {
        name: "Moroccan Tagine",
        description: "Slow-cooked stew with aromatic spices",
        instructions: [
          "Brown meat with spices",
          "Add vegetables",
          "Add broth and simmer",
          "Cook until tender",
          "Serve with couscous",
        ],
        ingredients: [
          { ingredient: lamb._id, quantity: 300, unit: "g" },
          { ingredient: onion._id, quantity: 200, unit: "g" },
          { ingredient: carrot._id, quantity: 200, unit: "g" },
          { ingredient: cumin._id, quantity: 5, unit: "g" },
          { ingredient: paprika._id, quantity: 5, unit: "g" },
          { ingredient: brownRice._id, quantity: 200, unit: "g" },
        ],
        servings: 4,
        prepTime: 20,
        cookTime: 90,
        difficulty: "medium",
        category: "dinner",
        country: "Morocco",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
      },
      {
        name: "Japanese Sushi Rolls",
        description: "Fresh sushi with rice and vegetables",
        instructions: [
          "Cook and season rice",
          "Prepare vegetables",
          "Roll in nori sheet",
          "Slice into pieces",
          "Serve with soy sauce",
        ],
        ingredients: [
          { ingredient: brownRice._id, quantity: 200, unit: "g" },
          { ingredient: cucumber._id, quantity: 100, unit: "g" },
          { ingredient: carrot._id, quantity: 100, unit: "g" },
          { ingredient: salmon._id, quantity: 100, unit: "g" },
        ],
        servings: 4,
        prepTime: 30,
        cookTime: 20,
        difficulty: "hard",
        category: "lunch",
        country: "Japan",
        imageUrl: "https://source.unsplash.com/800x600/?sushi,rolls,japanese",
      },
      {
        name: "Turkish Kebab",
        description: "Spiced meat grilled to perfection",
        instructions: [
          "Marinate lamb with spices",
          "Thread onto skewers",
          "Grill until cooked",
          "Serve with rice and salad",
          "Add yogurt sauce",
        ],
        ingredients: [
          { ingredient: lamb._id, quantity: 300, unit: "g" },
          { ingredient: onion._id, quantity: 100, unit: "g" },
          { ingredient: bellPepper._id, quantity: 150, unit: "g" },
          { ingredient: tomato._id, quantity: 150, unit: "g" },
          { ingredient: brownRice._id, quantity: 150, unit: "g" },
        ],
        servings: 3,
        prepTime: 30,
        cookTime: 20,
        difficulty: "medium",
        category: "dinner",
        country: "Turkey",
        imageUrl: "https://source.unsplash.com/800x600/?kebab,turkish",
      },
      {
        name: "Thai Green Curry",
        description: "Aromatic Thai curry with coconut milk",
        instructions: [
          "Make green curry paste",
          "Cook chicken until sealed",
          "Add coconut milk",
          "Add vegetables",
          "Simmer until cooked",
          "Serve with jasmine rice",
        ],
        ingredients: [
          { ingredient: chickenBreast._id, quantity: 250, unit: "g" },
          { ingredient: coconutMilk._id, quantity: 300, unit: "ml" },
          { ingredient: bellPepper._id, quantity: 150, unit: "g" },
          { ingredient: ginger._id, quantity: 20, unit: "g" },
          { ingredient: chiliPepper._id, quantity: 10, unit: "g" },
          { ingredient: brownRice._id, quantity: 200, unit: "g" },
        ],
        servings: 3,
        prepTime: 15,
        cookTime: 25,
        difficulty: "medium",
        category: "dinner",
        country: "Thailand",
        imageUrl: "https://source.unsplash.com/800x600/?green,curry,thai",
      },
    ];

    const recipes = await Recipe.insertMany(sampleRecipes);
    console.log(`✅ Inserted ${recipes.length} recipes`);

    // Populate and save to trigger nutrition calculation
    console.log("📊 Calculating nutrition values...");
    for (const recipe of recipes) {
      // Populate ingredients first
      await recipe.populate("ingredients.ingredient");
      // Mark ingredients as modified to trigger calculation
      recipe.markModified("ingredients");
      // Save to trigger pre-save hook
      await recipe.save();
    }
    console.log("✅ Nutrition values calculated");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${ingredients.length} ingredients`);
    console.log(`   - ${recipes.length} recipes`);
    console.log("\n✅ You can now start using the API!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();


