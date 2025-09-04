import express from "express";
import { body, validationResult } from "express-validator";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || "groq"; // groq, huggingface, openai
const AI_API_KEY = process.env.AI_API_KEY;

// Initialize AI client based on provider
let aiClient = null;

async function initializeAIClient() {
  if (!AI_API_KEY) {
    console.warn(
      `⚠️  Warning: AI_API_KEY environment variable is missing. AI features will be disabled.`
    );
    return null;
  }

  try {
    if (AI_PROVIDER === "groq") {
      // Groq client (OpenAI compatible)
      const { OpenAI } = await import("openai");
      aiClient = new OpenAI({
        apiKey: AI_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });
    } else if (AI_PROVIDER === "huggingface") {
      // Hugging Face client
      aiClient = {
        baseURL:
          "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
      };
    } else {
      // Default to OpenAI
      const { OpenAI } = await import("openai");
      aiClient = new OpenAI({
        apiKey: AI_API_KEY,
      });
    }

    console.log(
      `✅ AI client initialized successfully with provider: ${AI_PROVIDER}`
    );
    return aiClient;
  } catch (error) {
    console.error(`❌ Failed to initialize AI client:`, error.message);
    aiClient = null;
    return null;
  }
}

// Don't initialize immediately - wait for first request

// Generic AI completion function
async function generateAIResponse(prompt, maxTokens = 800) {
  try {
    // Ensure AI client is initialized
    if (!aiClient) {
      await initializeAIClient();
    }

    // If still no client, AI is disabled
    if (!aiClient) {
      throw new Error(
        "AI service is not configured. Please check your AI_API_KEY environment variable."
      );
    }

    if (AI_PROVIDER === "groq" || AI_PROVIDER === "openai") {
      const completion = await aiClient.chat.completions.create({
        model: AI_PROVIDER === "groq" ? "llama3-8b-8192" : "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert educator who creates clear, engaging content for students.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      });
      return completion.choices[0].message.content;
    } else if (AI_PROVIDER === "huggingface") {
      const response = await fetch(aiClient.baseURL, {
        method: "POST",
        headers: aiClient.headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: maxTokens,
            temperature: 0.7,
          },
        }),
      });
      const result = await response.json();
      return result[0]?.generated_text || "Unable to generate content";
    }
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("AI service unavailable: " + error.message);
  }
}

// Validation middleware
const validateTopicInput = [
  body("topic")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Topic must be at least 3 characters"),
  body("difficulty")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Invalid difficulty level"),
];

const validateQuizRequest = [
  body("topic").trim().isLength({ min: 3 }).withMessage("Topic is required"),
  body("questionCount")
    .optional()
    .isInt({ min: 5, max: 20 })
    .withMessage("Question count must be between 5 and 20"),
  body("difficulty").optional().isIn(["beginner", "intermediate", "advanced"]),
];

// @route   POST /api/ai/summary
// @desc    Generate AI summary for a topic
// @access  Private
router.post("/summary", verifyToken, validateTopicInput, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { topic, difficulty = "intermediate" } = req.body;

    const prompt = `Create a comprehensive yet concise summary about "${topic}" suitable for ${difficulty} level learners. 
    
    Structure the response as follows:
    1. Brief overview (2-3 sentences)
    2. Key concepts (3-5 main points)
    3. Important details and examples
    4. Practical applications or relevance
    
    Make it engaging and easy to understand while being informative.`;

    const summary = await generateAIResponse(prompt, 800);

    res.json({
      topic,
      difficulty,
      summary,
      wordCount: summary.split(" ").length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Summary error:", error);
    res.status(500).json({
      error: "Summary generation failed",
      message: "Unable to generate summary. Please try again.",
    });
  }
});

// @route   POST /api/ai/flashcards
// @desc    Generate flashcards for a topic
// @access  Private
router.post(
  "/flashcards",
  verifyToken,
  validateTopicInput,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { topic, difficulty = "intermediate", cardCount = 10 } = req.body;

      const prompt = `Create ${cardCount} flashcards about "${topic}" for ${difficulty} level learners.

    Format each flashcard as JSON with "front" (question/term) and "back" (answer/definition).
    Make questions clear and answers comprehensive but concise.
    Include a mix of definitions, concepts, and application questions.
    
    Return only a JSON array of flashcard objects.`;

      const response = await generateAIResponse(prompt, 1000);

      let flashcards;
      try {
        flashcards = JSON.parse(response);
      } catch (parseError) {
        throw new Error("Invalid JSON response from AI");
      }

      res.json({
        topic,
        difficulty,
        flashcards,
        count: flashcards.length,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("AI Flashcards error:", error);
      res.status(500).json({
        error: "Flashcard generation failed",
        message: "Unable to generate flashcards. Please try again.",
      });
    }
  }
);

// @route   POST /api/ai/quiz
// @desc    Generate interactive quiz for a topic
// @access  Private
router.post("/quiz", verifyToken, validateQuizRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { topic, difficulty = "intermediate", questionCount = 10 } = req.body;

    const prompt = `Create ${questionCount} multiple choice questions about "${topic}" for ${difficulty} level learners.

    Format each question as JSON with:
    - "question": the question text
    - "options": array of 4 possible answers (A, B, C, D)
    - "correctAnswer": the letter of the correct answer (A, B, C, or D)
    - "explanation": brief explanation of why the answer is correct
    - "difficulty": question difficulty (1-5 scale)
    
    Make questions challenging but fair, with plausible distractors.
    Return only a JSON array of question objects.`;

    const response = await generateAIResponse(prompt, 1500);

    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      throw new Error("Invalid JSON response from AI");
    }

    // Generate quiz ID for tracking
    const quizId = `quiz_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    res.json({
      quizId,
      topic,
      difficulty,
      questions,
      totalQuestions: questions.length,
      estimatedTime: questions.length * 2, // 2 minutes per question
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Quiz error:", error);
    res.status(500).json({
      error: "Quiz generation failed",
      message: "Unable to generate quiz. Please try again.",
    });
  }
});

// @route   POST /api/ai/explain
// @desc    Get detailed explanation of a concept
// @access  Private
router.post("/explain", verifyToken, validateTopicInput, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { topic, difficulty = "intermediate", context } = req.body;

    const prompt = `Provide a detailed explanation of "${topic}" for ${difficulty} level learners.
    ${context ? `Context: ${context}` : ""}
    
    Structure your explanation with:
    1. Simple definition
    2. Step-by-step breakdown
    3. Real-world examples
    4. Common misconceptions to avoid
    5. Tips for remembering/understanding
    
    Use analogies and examples to make complex concepts accessible.`;

    const explanation = await generateAIResponse(prompt, 1000);

    res.json({
      topic,
      difficulty,
      explanation,
      context: context || null,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Explanation error:", error);
    res.status(500).json({
      error: "Explanation generation failed",
      message: "Unable to generate explanation. Please try again.",
    });
  }
});

export default router;
