import express from "express";
import { validationResult } from "express-validator";
import { verifyToken } from "../middleware/auth.middleware.js";
import { initializeAIClient } from "../config/ai.config.js";
import {
  validateQuizRequest,
  validateTopicInput,
} from "../middleware/ai.middleware.js";
import {
  generateAISummaryforTopic,
  generateFlashcardsForTopic,
  generateQuizForTopic,
  getExplanationForTopic,
} from "../controllers/ai.controller.js";

const router = express.Router();

// @route   POST /api/ai/summary
// @desc    Generate AI summary for a topic
// @access  Private
router.post(
  "/summary",
  verifyToken,
  validateTopicInput,
  generateAISummaryforTopic
);

// @route   POST /api/ai/flashcards
// @desc    Generate flashcards for a topic
// @access  Private
router.post(
  "/flashcards",
  verifyToken,
  validateTopicInput,
  generateFlashcardsForTopic
);

// @route   POST /api/ai/quiz
// @desc    Generate interactive quiz for a topic
// @access  Private
router.post("/quiz", verifyToken, validateQuizRequest, generateQuizForTopic);

// @route   POST /api/ai/explain
// @desc    Get detailed explanation of a concept
// @access  Private
router.post(
  "/explain",
  verifyToken,
  validateTopicInput,
  getExplanationForTopic
);

export default router;
