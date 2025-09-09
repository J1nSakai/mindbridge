import express from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signupUser,
} from "../controllers/auth.controller.js";
import {
  validateLogin,
  validateSignup,
  verifyToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", validateSignup, signupUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, loginUser);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", logoutUser);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", verifyToken, getCurrentUser);

export default router;
