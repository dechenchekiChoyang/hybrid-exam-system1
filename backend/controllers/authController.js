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
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Get user including password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Optional portal role check
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This account is registered as ${user.role}, not ${role}.`,
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
      message: "Internal Server Error",
    });
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

/**
 * Create Staff Account (Instructor or Admin)
 */
export const createStaff = async (req, res) => {
  try {
    const { fullName, email, password, role, department, employeeId, phone } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password, and role are required.",
      });
    }

    if (!["instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Staff role must be either instructor or admin.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role,
      department,
      employeeId,
      phone,
    });

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("createStaff error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating staff account.",
    });
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password.",
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating password.",
    });
  }
};