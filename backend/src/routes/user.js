import express from "express";
import {
  getTopicSessions,
  getUserDashboardData,
  recordNewStudySession,
  testAPIConnection,
  updateTopicQuizData,
} from "../controllers/user.controller.js";
import {
  checkResourceOwnership,
  verifyToken,
} from "../middleware/auth.middleware.js";
import { validateStudySession } from "../middleware/user.middleware.js";

const router = express.Router();

// @route   POST /api/user/study-session
// @desc    Record a new study session
// @access  Private
router.post(
  "/study-session",
  verifyToken,
  validateStudySession,
  recordNewStudySession
);

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

// @route   GET /api/user/topic-sessions/:userId
// @desc    Get topic-specific sessions
// @access  Private
router.get(
  "/topic-sessions/:userId",
  verifyToken,
  checkResourceOwnership(),
  getTopicSessions
);

// @route   PUT /api/user/topic-quiz/:userId/:topicId
// @desc    Update user quiz data for a topic
// @access  Private
router.put(
  "/topic-quiz/:userId/:topicId",
  verifyToken,
  checkResourceOwnership(),
  updateTopicQuizData
);

export default router;
