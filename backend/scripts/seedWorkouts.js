require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const Workout = require("../models/Workout");

const workouts = [
    {
        name: "Arms & Shoulders",
        type: "guided", // Converted from standard
        exercises: [
            {
                name: "Overhead Barbell Press",
                sets: 4, reps: "8-12", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif",
                instructions: "Stand with feet shoulder-width apart. Press the bar straight up, locking out your elbows at the top."
            },
            {
                name: "Lateral Raises",
                sets: 3, reps: "12-15", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Jumping_Jacks.gif",
                instructions: "Lift dumbbells to the side until arms are parallel to the floor. Don't swing your body."
            },
            {
                name: "Front Dumbbell Raise",
                sets: 3, reps: "12-15", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/High_knees.gif",
                instructions: "Lift the dumbbell straight out in front of you. Keep your arm slightly bent."
            },
            {
                name: "Barbell Bicep Curls",
                sets: 4, reps: "10-12", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/2/22/Burpee.gif",
                instructions: "Keep elbows tucked by your sides. Curl the weight up towards your chest."
            },
            {
                name: "Tricep Rope Pushdown",
                sets: 4, reps: "12-15", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Plank_hold.gif",
                instructions: "Keep elbows fixed at your sides. Push the rope down and spread handles apart at the bottom."
            },
            {
                name: "Rear Delt Flys",
                sets: 3, reps: "15-20", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Mountain_Climbers.gif",
                instructions: "Bend over slightly. Lift weights out to the side focusing on the back of your shoulders."
            },
        ],
    },
    {
        name: "Back",
        type: "guided", // Converted from standard
        exercises: [
            {
                name: "Deadlift",
                sets: 4, reps: "6-8", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif",
                instructions: "Keep back flat and chest up. Lift by driving through your heels and extending hips."
            },
            {
                name: "Pull-Ups",
                sets: 3, reps: "Failure", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Jumping_Jacks.gif",
                instructions: "Pull yourself up until your chin is over the bar. Lower down with control."
            },
            {
                name: "Bent Over Barbell Row",
                sets: 4, reps: "8-10", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/High_knees.gif",
                instructions: "Bend knees slightly and hinge forward. Pull the bar to your lower chest."
            },
            {
                name: "Lat Pulldown",
                sets: 3, reps: "10-12", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/2/22/Burpee.gif",
                instructions: "Grip the bar wide. Pull down towards your upper chest, squeezing your shoulder blades."
            },
            {
                name: "Seated Cable Row",
                sets: 3, reps: "10-12", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Plank_hold.gif",
                instructions: "Sit upright with feet braced. Pull handle to your stomach, keeping elbows close."
            },
            {
                name: "Face Pulls",
                sets: 3, reps: "15-20", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Mountain_Climbers.gif",
                instructions: "Pull the rope towards your face, separating hands. Focus on rear delts."
            },
        ],
    },
    {
        name: "Chest",
        type: "guided", // Converted from standard
        exercises: [
            {
                name: "Bench Press",
                sets: 4, reps: "8-10", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif",
                instructions: "Lower the bar to your mid-chest. Press back up powerfully."
            },
            {
                name: "Incline Dumbbell Press",
                sets: 3, reps: "10-12", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Jumping_Jacks.gif",
                instructions: "Set bench to 30-45 degrees. Press dumbbells up and slightly inward."
            },
            {
                name: "Chest Flys",
                sets: 3, reps: "12-15", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/High_knees.gif",
                instructions: "Open arms wide like a hug. Squeeze chest muscles to bring weights together."
            },
            {
                name: "Push-Ups",
                sets: 3, reps: "Failure", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Pushups.gif",
                instructions: "Keep body in a straight line. Lower chest to floor and push back up."
            },
            {
                name: "Cable Crossover",
                sets: 3, reps: "12-15", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Plank_hold.gif",
                instructions: "Step forward. Bring handles together in front of your chest."
            },
            {
                name: "Dips",
                sets: 3, reps: "Failure", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Mountain_Climbers.gif",
                instructions: "Lower body until elbows are at 90 degrees. Push back up."
            },
        ],
    },
    {
        name: "Legs",
        type: "guided", // Converted from standard
        exercises: [
            {
                name: "Barbell Squat",
                sets: 4, reps: "6-8", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/High_knees.gif",
                instructions: "Feet shoulder-width apart. Sit back and down, keeping chest up."
            },
            {
                name: "Leg Press",
                sets: 3, reps: "10-12", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Jumping_Jacks.gif",
                instructions: "Lower platform until knees are 90 degrees. Push back up without locking knees."
            },
            {
                name: "Romanian Deadlift",
                sets: 4, reps: "8-10", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Man_Lifting_Barbell_Deadlift_GIF_Animation_Loop.gif",
                instructions: "Hinge at hips, keeping legs slightly bent. Lower bar down shins until you feel hamstring stretch."
            },
            {
                name: "Leg Extensions",
                sets: 3, reps: "12-15", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/2/22/Burpee.gif",
                instructions: "Extend legs until straight. Squeeze quads at the top."
            },
            {
                name: "Leg Curls",
                sets: 3, reps: "12-15", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Plank_hold.gif",
                instructions: "Curl heels towards your glutes. Control the weight on the way down."
            },
            {
                name: "Calf Raises",
                sets: 4, reps: "15-20", duration: 360, breakDuration: 120,
                videoUrl: "", gifUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Mountain_Climbers.gif",
                instructions: "Rise up onto toes as high as possible. Lower heels below platform level."
            },
        ],
    },
    {
        name: "30-Min Cardio Blast",
        type: "guided",
        exercises: [
            {
                name: "High Knees",
                duration: 300,
                breakDuration: 30,
                gifUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/High_knees.gif",
                instructions: "Run in place, driving knees up to hip height. Keep a fast pace!"
            },
            {
                name: "Plank Hold",
                duration: 300,
                breakDuration: 30,
                gifUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Plank_hold.gif",
                instructions: "Keep body in straight line from head to heels. Engage core and don't let hips sag."
            },
            {
                name: "Jumping Jacks",
                duration: 300,
                breakDuration: 30,
                gifUrl: "https://upload.wikimedia.org/wikipedia/commons/5/56/Jumping_jacks.gif",
                instructions: "Jump feet apart and raise arms overhead. Jump feet back together. Repeat quickly."
            },
            {
                name: "Mountain Climbers",
                duration: 300,
                breakDuration: 30,
                gifUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Mountain_Climbers.gif",
                instructions: "Start in plank. Drive one knee to chest, then switch quickly. Keep hips low."
            },
            {
                name: "Burpees",
                duration: 300,
                breakDuration: 30,
                gifUrl: "https://upload.wikimedia.org/wikipedia/commons/2/22/Burpee.gif",
                instructions: "Drop to floor, do a pushup (optional), jump feet in, then jump straight up reaching overhead."
            },
        ],
    },
];

const seedDB = async () => {
    // Standardize URI: app.js uses MONGO_URI
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cooking-app";
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for Seeding");

        await Workout.deleteMany({});
        console.log("Cleared existing workouts");

        await Workout.insertMany(workouts);
        console.log("Seeded workouts successfully");

        mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
};

seedDB();
