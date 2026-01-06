const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      // required: [true, "Password is required"], // Made optional for Firebase users
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: null,
    },
    favoriteRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    // New: Body Metrics for BMI & Nutrition
    metrics: {
      age: { type: Number },
      gender: { type: String, enum: ['male', 'female'] },
      height: { type: Number }, // cm
      weight: { type: Number }, // kg
      activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'extreme'], default: 'moderate' },
      goal: { type: String, enum: ['lose', 'maintain', 'gain'], default: 'maintain' },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// NO PRE-SAVE HOOK - Password is hashed in the controller

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);





