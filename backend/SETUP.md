# Quick Setup Guide for School Project

## Step-by-Step MongoDB Setup

### For MongoDB Atlas (Easiest - No Installation Required)

1. **Sign up for MongoDB Atlas** (Free)
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Use your school email or personal email

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Select "M0 FREE" tier
   - Choose any cloud provider and region
   - Click "Create"

3. **Create Database User**
   - Username: `admin` (or any username)
   - Password: Create a strong password (save it!)
   - Click "Create Database User"

4. **Allow Network Access**
   - Click "Add My Current IP Address"
   - Or click "Allow Access from Anywhere" (for development only)
   - Click "Finish and Close"

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your database user credentials
   - Add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cooking_recipes?retryWrites=true&w=majority`

### For Local MongoDB (If You Prefer)

1. **Download MongoDB Community Server**
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb` (Ubuntu/Debian)

2. **Start MongoDB**
   - Windows: Usually starts automatically as a service
   - Mac/Linux: Run `mongod` in terminal

3. **Connection String**
   ```
   mongodb://localhost:27017/cooking_recipes
   ```

## Project Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install packages:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   - Create a new file named `.env` in the `backend` folder
   - Add your MongoDB connection string:
     ```env
     MONGO_URI=your_connection_string_here
     PORT=5000
     ```
   - Example for Atlas:
     ```env
     MONGO_URI=mongodb+srv://admin:mypassword@cluster0.xxxxx.mongodb.net/cooking_recipes?retryWrites=true&w=majority
     PORT=5000
     ```
   - Example for Local:
     ```env
     MONGO_URI=mongodb://localhost:27017/cooking_recipes
     PORT=5000
     ```

4. **Seed the database (Adds sample data):**
   ```bash
   npm run seed
   ```
   This will add 15 sample ingredients and 4 sample recipes to your database.

5. **Start the server:**
   ```bash
   npm run dev
   ```

6. **Test the API:**
   - Open browser: http://localhost:5000
   - Should see: "API is running 🚀"
   - Test ingredients: http://localhost:5000/api/ingredients
   - Test recipes: http://localhost:5000/api/recipes

## Common Issues

**Problem:** "Cannot connect to MongoDB"
- **Solution:** Check your `.env` file has the correct `MONGO_URI`
- For Atlas: Make sure your IP is whitelisted
- For Local: Make sure MongoDB is running

**Problem:** "Authentication failed"
- **Solution:** Check your username and password in the connection string

**Problem:** "Module not found"
- **Solution:** Run `npm install` in the backend folder

## API Testing

You can test the API using:
- Browser (for GET requests)
- Postman
- curl command
- Your mobile/web app

Example GET request:
```bash
curl http://localhost:5000/api/ingredients
```

Example POST request (create ingredient):
```bash
curl -X POST http://localhost:5000/api/ingredients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spinach",
    "caloriesPer100g": 23,
    "proteinPer100g": 2.9,
    "carbsPer100g": 3.6,
    "fatsPer100g": 0.4,
    "category": "vegetable"
  }'
```

## Next Steps

Once your backend is running:
1. Connect your mobile/web app to `http://localhost:5000/api`
2. Start making API calls to create, read, update, and delete recipes/ingredients
3. The API automatically calculates nutrition values for recipes!



