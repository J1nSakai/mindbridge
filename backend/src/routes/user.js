import express from "express";
import {
  getUserAchievementsAndBadges,
  getUserDashboardData,
  getUserLearningProgress,
  getUserProfileAndPreferences,
  recordNewStudySession,
  testAPIConnection,
  updateUserProfileAndPreferences,
} from "../controllers/user.controller.js";
import { checkResourceOwnership, verifyToken } from "../middleware/auth.js";
import {
  validateProfileUpdate,
  validateStudySession,
} from "../middleware/user.middleware.js";

const router = express.Router();

// @route   GET /api/user/progress/:userId
// @desc    Get user's learning progress
// @access  Private
router.get(
  "/progress/:userId",
  verifyToken,
  checkResourceOwnership(),
  getUserLearningProgress
);

// @route   POST /api/user/study-session
// @desc    Record a new study session
// @access  Private
router.post(
  "/study-session",
  verifyToken,
  validateStudySession,
  recordNewStudySession
);

// @route   GET /api/user/profile/:userId
// @desc    Get user profile and preferences
// @access  Private
router.get(
  "/profile/:userId",
  verifyToken,
  checkResourceOwnership(),
  getUserProfileAndPreferences
);

// @route   PUT /api/user/profile/:userId
// @desc    Update user profile and preferences
// @access  Private
router.put(
  "/profile/:userId",
  verifyToken,
  checkResourceOwnership(),
  validateProfileUpdate,
  updateUserProfileAndPreferences
);

// @route   GET /api/user/achievements/:userId
// @desc    Get user's achievements and badges
// @access  Private
router.get("/achievements/:userId", getUserAchievementsAndBadges);

// @route   GET /api/user/test
// @desc    Test API connection
// @access  Private
router.get("/test", verifyToken, testAPIConnection);

// @route   GET /api/user/dashboard/:userId
// @desc    Get user dashboard data
// @access  Private
router.get(
  "/dashboard/:userId",
  verifyToken,
  checkResourceOwnership(),
  getUserDashboardData
);

export default router;
