import { body } from "express-validator";

// Validation middleware
export const validateStudySession = [
  body("topic").trim().isLength({ min: 3 }).withMessage("Topic is required"),
  body("type")
    .isIn(["summary", "flashcards", "quiz", "complete"])
    .withMessage("Invalid session type"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),
  body("score")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .withMessage("Score must be between 0 and 100"),
  body("questionsAnswered")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Questions answered must be a non-negative integer"),
  body("correctAnswers")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Correct answers must be a non-negative integer"),
];

export const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("preferences")
    .optional()
    .isObject()
    .withMessage("Preferences must be an object"),
  body("studyGoals")
    .optional()
    .isObject()
    .withMessage("Study goals must be an object"),
];
