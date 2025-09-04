import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { Client, Users, ID, TablesDB, Query } from "node-appwrite";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);
const tablesDB = new TablesDB(client);

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

    // Create user in Appwrite Authentication using Users service
    const userId = ID.unique();
    // const user = await users.create(userId, email, undefined, password, name);
    const user = await users.create({
      userId: userId,
      email: email,
      password: password,
      name: name,
    });
    console.log("✅ User created in Appwrite Auth:", user.$id);

    // Create user profile in database
    try {
      // const userProfile = await tablesDB.createRow(
      //   process.env.APPWRITE_DATABASE_ID,
      //   process.env.APPWRITE_USERS_COLLECTION_ID,
      //   ID.unique(),
      //   {
      //     userId: user.$id,
      //     name: user.name,
      //     email: user.email,
      //     preferences: JSON.stringify({
      //       theme: "light",
      //       notifications: true,
      //       difficulty: "intermediate",
      //     }),
      //     totalStudyTime: 0,
      //     streak: 0,
      //     lastActiveDate: new Date().toISOString(),
      //   }
      // );
      // console.log("✅ User profile created in database:", userProfile.$id);
      const userProfile = await tablesDB.createRow({
        databaseId: process.env.APPWRITE_DATABASE_ID,
        tableId: process.env.APPWRITE_USERS_COLLECTION_ID,
        rowId: ID.unique(),
        data: {
          userId: user.$id,
          name: user.name,
          email: user.email,
          preferences: JSON.stringify({
            theme: "light",
            notifications: true,
            difficulty: "intermediate",
          }),
          totalStudyTime: 0,
          streak: 0,
          lastActiveDate: new Date().toISOString(),
        },
      });
      console.log("✅ User profile created in database:", userProfile.$id);
    } catch (dbError) {
      console.error("❌ Failed to create user profile:", dbError);
      // Continue without failing - user auth was successful
    }

    // Create game character in database
    try {
      const gameCharacter = await tablesDB.createRow({
        databaseId: process.env.APPWRITE_DATABASE_ID,
        tableId: process.env.APPWRITE_CHARACTERS_COLLECTION_ID,
        rowId: ID.unique(),
        data: {
          userId: user.$id,
          level: 1,
          experience: 0,
          health: 100,
          maxHealth: 100,
          attack: 10,
          defense: 5,
          gold: 0,
          inventory: JSON.stringify([]),
          achievements: JSON.stringify([]),
          battlesWon: 0,
          totalBattles: 0,
        },
      });
      console.log("✅ Game character created in database:", gameCharacter.$id);
    } catch (dbError) {
      console.error("❌ Failed to create game character:", dbError);
      // Continue without failing - user auth was successful
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.$id,
        email: user.email,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token: token,
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);

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

    const { email } = req.body;

    // Get user by email using Users service
    // const userList = await users.list([`email=${email}`]);
    const userList = await users.list({
      queries: [Query.equal("email", [email])],
    });

    console.log(userList);

    if (userList.total === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    const user = userList.users[0];

    // Note: Password verification should be handled by Appwrite's authentication
    // For server-side auth, we'll generate a JWT token
    const token = jwt.sign(
      {
        userId: user.$id,
        email: user.email,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    console.log("✅ User logged in successfully:", user.$id);

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
    console.error("❌ Login error:", error);

    if (error.code === 401 || error.code === 404) {
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
router.post("/logout", async (_req, res) => {
  try {
    // For server-side auth, we just need to invalidate the JWT token
    // The frontend will remove the token from localStorage
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
router.get("/me", verifyToken, async (req, res) => {
  try {
    // Extract user ID from JWT token (set by auth middleware)
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }

    // Get user details using Users service
    const user = await users.get(userId);

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
