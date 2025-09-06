import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { Client, Users } from "node-appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    );
    req.user = decoded;

    // Optionally verify user exists in Appwrite
    try {
      await users.get(decoded.userId);
    } catch (appwriteError) {
      console.warn("Appwrite user verification failed:", appwriteError.message);
      // Continue with JWT verification only
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token is malformed or invalid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Please login again",
      });
    }

    res.status(401).json({
      error: "Authentication failed",
      message: "Unable to verify token",
    });
  }
};

// Middleware to check if user owns the resource
export const checkResourceOwnership = (resourceParam = "userId") => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceParam];
    const tokenUserId = req.user.userId;

    if (resourceUserId !== tokenUserId) {
      return res.status(403).json({
        error: "Access forbidden",
        message: "You can only access your own resources",
      });
    }

    next();
  };
};

// Middleware for optional authentication (for public endpoints that benefit from user context)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      );
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Validation middleware
export const validateSignup = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
];

export const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export default {
  verifyToken,
  checkResourceOwnership,
  optionalAuth,
};
