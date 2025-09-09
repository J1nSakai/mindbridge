import { validationResult } from "express-validator";
import { initializeAIClient } from "../config/ai.config.js";

// Generic AI completion function
async function generateAIResponse(prompt, maxTokens = 800) {
  try {
    // Initialize AI client based on provider
    const aiClient = await initializeAIClient();
    // Ensure AI client is initialized
    if (!aiClient) {
      throw new Error("AI client not initialized");
    }

    // If still no client, AI is disabled
    if (!aiClient) {
      throw new Error(
        "AI service is not configured. Please check your AI_API_KEY environment variable."
      );
    }

    const completion = await aiClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("AI service unavailable: " + error.message);
  }
}

export const generateAISummaryforTopic = async (req, res) => {
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
};

export const generateFlashcardsForTopic = async (req, res) => {
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
    For any flashcard with a programming language markdown, or any text in markdown,
    DO NOT wrap the text with backticks. Instead, just produce it as a plain text.
    
    Return only a JSON array of flashcard objects.`;

    const response = await generateAIResponse(prompt, 1000);

    let flashcards;
    try {
      flashcards = JSON.parse(response);
      console.log(flashcards);
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
};

export const generateQuizForTopic = async (req, res) => {
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
};

export const getExplanationForTopic = async (req, res) => {
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
};
