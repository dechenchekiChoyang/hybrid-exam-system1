import express from "express";
import {
  register,
  login,
  getProfile,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student Registration
router.post("/register", register);

// User Login
router.post("/login", login);

// Logged-in User Profile
router.get("/profile", protect, getProfile);

router.post(
  "/create-staff",
  protect,
  authorize("admin"),
  (req, res) => {
    res.status(501).json({
      message: "Create staff API will be implemented in the next step.",
    });
  }
);

router.patch("/change-password", protect, (req, res) => {
  res.status(501).json({
    message: "Change password API will be implemented in the next step.",
  });
});

export default router;