const Workout = require("../models/Workout");

// @desc    Get all workouts
// @route   GET /api/fitness/workouts
// @access  Public
exports.getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find();
        res.status(200).json(workouts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get single workout
// @route   GET /api/fitness/workouts/:id
// @access  Public
exports.getWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) {
            return res.status(404).json({ success: false, error: "Workout not found" });
        }
        res.status(200).json({ success: true, data: workout });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create a new workout
// @route   POST /api/fitness/workouts
// @access  Private/Admin
exports.createWorkout = async (req, res) => {
    try {
        const workout = await Workout.create(req.body);
        res.status(201).json({
            success: true,
            data: workout,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// @desc    Update a workout
// @route   PUT /api/fitness/workouts/:id
// @access  Private/Admin
exports.updateWorkout = async (req, res) => {
    try {
        const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!workout) {
            return res.status(404).json({
                success: false,
                error: "Workout not found",
            });
        }

        res.status(200).json({
            success: true,
            data: workout,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// @desc    Delete a workout
// @route   DELETE /api/fitness/workouts/:id
// @access  Private/Admin
exports.deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findByIdAndDelete(req.params.id);

        if (!workout) {
            return res.status(404).json({
                success: false,
                error: "Workout not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
