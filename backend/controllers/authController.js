const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key-change-in-production", {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("favoriteRecipes");
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, avatar },
      {
        new: true,
        runValidators: true,
      }
    ).populate("favoriteRecipes");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Login with Firebase (Trusted Client)
// @route   POST /api/auth/firebase
// @access  Public
exports.firebaseLogin = async (req, res) => {
  try {
    const { email, uid, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update UID if missing
      let wasUpdated = false;
      if (!user.firebaseUid && uid) {
        user.firebaseUid = uid;
        wasUpdated = true;
      }

      // FORCE ADMIN ROLE if email matches
      if ((email.toLowerCase().startsWith('admin') || email.toLowerCase() === 'omaromar@gmail.com' || email.toLowerCase() === 'omaradmin@gmail.com') && user.role !== 'admin') {
        user.role = 'admin';
        wasUpdated = true;
      }

      if (wasUpdated) {
        await user.save();
      }
    } else {
      // Create new user
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        firebaseUid: uid,
        role: (email.toLowerCase().startsWith('admin') || email.toLowerCase() === 'omaromar@gmail.com' || email.toLowerCase() === 'omaradmin@gmail.com') ? 'admin' : 'user',
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) // Dummy password
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
