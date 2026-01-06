const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");
const DailyLog = require("../models/DailyLog");
const User = require("../models/User");

// --- WORKOUT ROUTES ---

// GET /api/fitness/workouts
// Get all available workout plans
const {
    getWorkouts,
    getWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout
} = require("../controllers/workoutController");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/admin");

// --- WORKOUT ROUTES ---

// GET /api/fitness/workouts
router.get("/workouts", getWorkouts);
router.get("/workouts/:id", getWorkout);

// Admin Routes
router.post("/workouts", protect, admin, createWorkout);
router.put("/workouts/:id", protect, admin, updateWorkout);
router.delete("/workouts/:id", protect, admin, deleteWorkout);


// --- DAILY LOG ROUTES ---

// GET /api/fitness/log/:date?userId=...
// Get daily log for a specific user and date
router.get("/log/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        let log = await DailyLog.findOne({ user: userId, date });

        if (!log) {
            // Return empty defaults if no log exists yet
            return res.json({
                user: userId,
                date,
                calories: 0,
                protein: 0,
                carbs: 0,
                water: 0,
            });
        }

        res.json(log);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/fitness/log
// Create or update a daily log
router.post("/log", async (req, res) => {
    try {
        const { userId, date, calories, protein, carbs, water } = req.body;

        if (!userId || !date) {
            return res.status(400).json({ message: "User ID and Date are required" });
        }

        // Upsert: update if exists, insert if not
        const log = await DailyLog.findOneAndUpdate(
            { user: userId, date },
            { $set: { calories, protein, carbs, water } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(log);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
