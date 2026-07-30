import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      department,
      course,
      semester,
      enrollmentId,
      employeeId,
      phone,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }
    const allowedRoles = ["student", "instructor"];

    const userRole =
      role && allowedRoles.includes(role)
        ? role
        : "student";
    const user = await User.create({
      fullName,
      email,
      password,
      role: userRole,
      department,
      course,
      semester,
      enrollmentId,
      employeeId,
      phone,
    });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
     },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Get user including password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
    success: false,
    message: "Internal Server Error",});
  }
};

/**
 * Get logged-in user's profile
 */
export const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};