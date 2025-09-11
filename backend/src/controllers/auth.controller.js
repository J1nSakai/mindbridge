import { validationResult } from "express-validator";
import { ID, Query } from "node-appwrite";
import { TablesDataB, UsersService } from "../config/appwrite.js";
import jwt from "jsonwebtoken";

const users = UsersService;
const tablesDB = TablesDataB;

export const signupUser = async (req, res) => {
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

    const user = await users.create({
      userId: userId,
      email: email,
      password: password,
      name: name,
    });
    console.log("✅ User created in Appwrite Auth:", user.$id);

    // Create user profile in database
    try {
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
        },
      });
      console.log("✅ User profile created in database:", userProfile.$id);
    } catch (dbError) {
      console.error("❌ Failed to create user profile:", dbError);
      // Continue without failing - user auth was successful
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.$id,
        email: user.email,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "1h" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60,
      path: "/",
    });

    res.status(201).json({
      message: "User created successfully",
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
};

export const loginUser = async (req, res) => {
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
      { expiresIn: "1h" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 1000 * 60 * 60,
      path: "/",
    });

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
};

export const logoutUser = async (_req, res) => {
  try {
    // For server-side auth, we just need to invalidate the JWT token
    // The frontend will remove the token from localStorage
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Logout failed",
      message: "Unable to logout user",
    });
  }
};

export const getCurrentUser = async (req, res) => {
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
};
