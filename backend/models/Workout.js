const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  name: {
    type: String, // e.g., "Arms & Shoulders", "Back", etc.
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['standard', 'guided'],
    default: 'standard'
  },
  bodypart: {
    type: String,
    required: true,
    default: 'General'
  },
  sets: {
    type: Number,
    default: 3
  },
  imageUrl: {
    type: String, // GIF or Image
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  exercises: [
    {
      name: { type: String, required: true },
      // Optional for standard
      sets: { type: Number },
      reps: { type: String },
      videoUrl: { type: String, default: "" },
      gifUrl: { type: String },

      // Optional for guided
      duration: { type: Number }, // seconds
      breakDuration: { type: Number }, // seconds

      // Advice / Instructions
      instructions: { type: String, default: "Keep core tight and maintain steady breathing." },
    },
  ],
});

module.exports = mongoose.model("Workout", workoutSchema);
