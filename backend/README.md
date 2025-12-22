# Cooking Recipe API Backend

A RESTful API for managing recipes and ingredients with nutritional tracking (calories, protein, carbs, fats).

## MongoDB Setup

This project requires MongoDB. You have two options:

### Option 1: MongoDB Atlas (Cloud - Recommended for School Projects)

1. **Create a free MongoDB Atlas account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account (M0 Free Tier)

2. **Create a Cluster:**
   - Choose a cloud provider (AWS, Google Cloud, or Azure)
   - Select a free tier (M0)
   - Choose a region close to you
   - Click "Create Cluster"

3. **Set up Database Access:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Set up Network Access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `cooking_recipes` (or any name you prefer)

### Option 2: Local MongoDB

1. **Install MongoDB locally:**
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB:**
   - Windows: MongoDB should start as a service automatically
   - Mac/Linux: `mongod` (or `brew services start mongodb-community` on Mac)

3. **Connection String:**
   ```
   mongodb://localhost:27017/cooking_recipes
   ```

## Project Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create a `.env` file:**
   Create a file named `.env` in the `backend` directory with:
   ```env
   # For MongoDB Atlas (Cloud):
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cooking_recipes?retryWrites=true&w=majority
   
   # OR for Local MongoDB:
   # MONGO_URI=mongodb://localhost:27017/cooking_recipes
   
   PORT=5000
   ```
   
   **Important:** Replace `username` and `password` with your MongoDB Atlas credentials, or use the local connection string if using local MongoDB.

3. **Seed the database (Optional but recommended):**
   This will populate your database with sample ingredients and recipes:
   ```bash
   npm run seed
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify it's working:**
   - Open your browser and go to: `http://localhost:5000`
   - You should see: "API is running 🚀"
   - Test the API: `http://localhost:5000/api/ingredients`

## Troubleshooting

### Connection Issues

- **"MongoDB connection error"**: 
  - Check your `.env` file exists and has the correct `MONGO_URI`
  - For Atlas: Verify your IP is whitelisted in Network Access
  - For Atlas: Check your username and password are correct
  - For Local: Make sure MongoDB is running (`mongod` command)

- **"Authentication failed"**:
  - Double-check your MongoDB username and password in the connection string
  - Make sure you've created a database user in MongoDB Atlas

- **"Cannot connect to server"**:
  - For Local: Ensure MongoDB service is running
  - For Atlas: Check your internet connection

## API Endpoints

### Ingredients

- `GET /api/ingredients` - Get all ingredients (supports query: `?category=vegetable&search=tomato`)
- `GET /api/ingredients/:id` - Get single ingredient
- `POST /api/ingredients` - Create new ingredient
- `PUT /api/ingredients/:id` - Update ingredient
- `DELETE /api/ingredients/:id` - Delete ingredient

**Ingredient Schema:**
```json
{
  "name": "Chicken Breast",
  "caloriesPer100g": 165,
  "proteinPer100g": 31,
  "carbsPer100g": 0,
  "fatsPer100g": 3.6,
  "category": "meat"
}
```

### Recipes

- `GET /api/recipes` - Get all recipes (supports query: `?category=dinner&difficulty=easy&search=pasta`)
- `GET /api/recipes/:id` - Get single recipe with full details
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/calculate-nutrition` - Calculate nutrition for custom ingredient list

**Recipe Schema:**
```json
{
  "name": "Grilled Chicken Salad",
  "description": "Healthy and delicious",
  "instructions": ["Step 1", "Step 2"],
  "ingredients": [
    {
      "ingredient": "ingredient_id",
      "quantity": 200,
      "unit": "g"
    }
  ],
  "servings": 2,
  "prepTime": 15,
  "cookTime": 20,
  "difficulty": "easy",
  "category": "dinner"
}
```

**Nutrition Calculation:**
The API automatically calculates total calories, protein, carbs, and fats based on ingredients. It also provides `perServing` values.

## Models

### Ingredient
- name (unique, required)
- caloriesPer100g (required)
- proteinPer100g (required)
- carbsPer100g (default: 0)
- fatsPer100g (default: 0)
- category (enum: vegetable, fruit, meat, dairy, grain, spice, oil, other)

### Recipe
- name (required)
- description
- instructions (array, required)
- ingredients (array of {ingredient, quantity, unit}, required)
- servings (default: 1)
- prepTime (minutes)
- cookTime (minutes)
- difficulty (enum: easy, medium, hard)
- category (enum: breakfast, lunch, dinner, snack, dessert, appetizer, beverage, other)
- imageUrl
- totalCalories (auto-calculated)
- totalProtein (auto-calculated)
- totalCarbs (auto-calculated)
- totalFats (auto-calculated)

## Unit Conversions

Supported units: `g`, `kg`, `ml`, `l`, `cup`, `tbsp`, `tsp`, `piece`, `slice`

The API automatically converts quantities to grams for nutritional calculations.




