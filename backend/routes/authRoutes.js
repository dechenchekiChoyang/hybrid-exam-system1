import express from "express";
import {
  register,
  login,
  getProfile,
  createStaff,
  changePassword,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student Registration
router.post("/register", register);

// User Login
router.post("/login", login);

// Logged-in User Profile
router.get("/profile", protect, getProfile);

// Admin-only Staff Creation
router.post("/create-staff", protect, authorize("admin"), createStaff);

// Change Password
router.patch("/change-password", protect, changePassword);

export default router;