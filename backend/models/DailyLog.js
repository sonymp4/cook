const mongoose = require("mongoose");

const dailyLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: String, // Storing as YYYY-MM-DD string for easy querying
        required: true,
    },
    calories: { type: Number, default: 0 }, // kcal
    protein: { type: Number, default: 0 }, // grams
    carbs: { type: Number, default: 0 }, // grams
    water: { type: Number, default: 0 }, // ml
});

// index for faster queries by user and date
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyLog", dailyLogSchema);
