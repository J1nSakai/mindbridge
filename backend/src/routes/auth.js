import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Client, Account, ID } from "node-appwrite";

const router = express.Router();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const account = new Account(client);

// Validation middleware
const validateSignup = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
];

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { email, password, name } = req.body;

    // Create user in Appwrite
    const user = await account.create(ID.unique(), email, password, name);

    // Initialize user's game character
    const gameCharacter = {
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      gold: 0,
      inventory: [],
      achievements: [],
      currentQuest: null,
    };

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        gameCharacter,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 409) {
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this email already exists",
      });
    }

    res.status(500).json({
      error: "Registration failed",
      message: "Unable to create user account",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Create session in Appwrite
    const session = await account.createEmailPasswordSession(email, password);

    // Get user details
    const user = await account.get();

    // Generate JWT token for frontend
    const token = jwt.sign(
      {
        userId: user.$id,
        email: user.email,
        sessionId: session.$id,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error.code === 401) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    res.status(500).json({
      error: "Login failed",
      message: "Unable to authenticate user",
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", async (req, res) => {
  try {
    // Delete current session in Appwrite
    await account.deleteSession("current");

    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Logout failed",
      message: "Unable to logout user",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", async (req, res) => {
  try {
    const user = await account.get();

    res.json({
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification,
        registration: user.registration,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired session",
    });
  }
});

export default router;
