import { body } from "express-validator";

// Validation middleware
export const validateStudySession = [
  body("topic").trim().isLength({ min: 3 }).withMessage("Topic is required"),
  body("type")
    .isIn(["summary", "flashcards", "quiz", "complete"])
    .withMessage("Invalid session type"),
  body("totalQuestions")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Total questions must be a non-negative integer"),
  body("questionsAnswered")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Questions answered must be a non-negative integer"),
  body("correctAnswers")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Correct answers must be a non-negative integer"),
  body("generatedSummary")
    .optional({ nullable: true })
    .isString()
    .withMessage("Generated summary must be a string"),
  body("flashCards")
    .optional({ nullable: true })
    .isString()
    .withMessage("Flashcards must be a string"),
  body("quizData")
    .optional({ nullable: true })
    .isString()
    .withMessage("Quiz data must be a string"),
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
