const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/cookdb");
        console.log("MongoDB Connected");

        const email = "omaromar@gmail.com";
        const password = "jacalo001";
        const name = "Admin Omar";

        let user = await User.findOne({ email });

        if (user) {
            console.log("User found, updating to admin...");
            user.role = "admin";
            // Update password if needed, but hash it first
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            console.log("User updated to Admin.");
        } else {
            console.log("User not found, creating admin...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: "admin",
            });
            console.log("Admin User Created.");
        }

        // Seed fallback admin
        const email2 = "omaradmin@gmail.com";
        const user2 = await User.findOne({ email: email2 });
        if (!user2) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await User.create({
                name: "Admin Fallback",
                email: email2,
                password: hashedPassword,
                role: "admin",
            });
            console.log("Fallback Admin Created.");
        }

        process.exit();
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
