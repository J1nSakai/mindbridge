import { body } from "express-validator";

export const validateTopicInput = [
  body("topic")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Topic must be at least 3 characters"),
  body("difficulty")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Invalid difficulty level"),
];

export const validateQuizRequest = [
  body("topic").trim().isLength({ min: 3 }).withMessage("Topic is required"),
  body("questionCount")
    .optional()
    .isInt({ min: 5, max: 20 })
    .withMessage("Question count must be between 5 and 20"),
  body("difficulty").optional().isIn(["beginner", "intermediate", "advanced"]),
];
