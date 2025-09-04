import express from "express";
import { body, validationResult } from "express-validator";
import { Client, TablesDB, Query, ID } from "node-appwrite";
import { verifyToken, checkResourceOwnership } from "../middleware/auth.js";

const router = express.Router();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const tablesDB = new TablesDB(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID;
const PROGRESS_COLLECTION_ID = process.env.APPWRITE_PROGRESS_COLLECTION_ID;
const STUDY_SESSIONS_COLLECTION_ID =
  process.env.APPWRITE_STUDY_SESSIONS_COLLECTION_ID;

// Validation middleware
const validateStudySession = [
  body("topic").trim().isLength({ min: 3 }).withMessage("Topic is required"),
  body("type")
    .isIn(["summary", "flashcards", "quiz", "game"])
    .withMessage("Invalid session type"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),
  body("score")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Score must be between 0 and 100"),
];

const validateProfileUpdate = [
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

// @route   GET /api/user/progress/:userId
// @desc    Get user's learning progress
// @access  Private
router.get(
  "/progress/:userId",
  verifyToken,
  checkResourceOwnership(),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe = "week" } = req.query; // week, month, year, all

      // Calculate date range
      const now = new Date();
      let startDate;

      switch (timeframe) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      // Get study sessions
      const sessions = await tablesDB.listDocuments(
        DATABASE_ID,
        STUDY_SESSIONS_COLLECTION_ID,
        [
          Query.equal("userId", userId),
          Query.greaterThanEqual("createdAt", startDate.toISOString()),
          Query.orderDesc("createdAt"),
          Query.limit(100),
        ]
      );

      // Calculate progress statistics
      const stats = calculateProgressStats(sessions.documents);

      res.json({
        userId,
        timeframe,
        stats,
        recentSessions: sessions.documents.slice(0, 10),
        totalSessions: sessions.total,
      });
    } catch (error) {
      console.error("Get progress error:", error);
      res.status(500).json({
        error: "Failed to get progress",
        message: "Unable to retrieve progress data",
      });
    }
  }
);

// @route   POST /api/user/study-session
// @desc    Record a new study session
// @access  Private
router.post(
  "/study-session",
  verifyToken,
  validateStudySession,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const {
        userId,
        topic,
        type,
        duration,
        score,
        questionsAnswered,
        correctAnswers,
      } = req.body;

      const session = await tablesDB.createDocument(
        DATABASE_ID,
        STUDY_SESSIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          topic,
          type,
          duration,
          score: score || null,
          questionsAnswered: questionsAnswered || null,
          correctAnswers: correctAnswers || null,
          accuracy: questionsAnswered
            ? Math.round((correctAnswers / questionsAnswered) * 100)
            : null,
          createdAt: new Date().toISOString(),
        }
      );

      // Update user's overall progress
      await updateUserProgress(userId, session);

      res.status(201).json({
        message: "Study session recorded successfully",
        session: {
          id: session.$id,
          topic: session.topic,
          type: session.type,
          duration: session.duration,
          score: session.score,
          accuracy: session.accuracy,
          createdAt: session.createdAt,
        },
      });
    } catch (error) {
      console.error("Record study session error:", error);
      res.status(500).json({
        error: "Failed to record session",
        message: "Unable to save study session",
      });
    }
  }
);

// @route   GET /api/user/profile/:userId
// @desc    Get user profile and preferences
// @access  Private
router.get(
  "/profile/:userId",
  verifyToken,
  checkResourceOwnership(),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const profile = await tablesDB.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );

      res.json({
        profile: {
          id: profile.$id,
          name: profile.name,
          email: profile.email,
          preferences: profile.preferences
            ? JSON.parse(profile.preferences)
            : {},
          studyGoals: profile.studyGoals ? JSON.parse(profile.studyGoals) : {},
          joinedAt: profile.createdAt,
          lastActive: profile.lastActive,
          totalStudyTime: profile.totalStudyTime || 0,
          streak: profile.streak || 0,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);

      if (error.code === 404) {
        return res.status(404).json({
          error: "Profile not found",
          message: "User profile does not exist",
        });
      }

      res.status(500).json({
        error: "Failed to get profile",
        message: "Unable to retrieve user profile",
      });
    }
  }
);

// @route   PUT /api/user/profile/:userId
// @desc    Update user profile and preferences
// @access  Private
router.put(
  "/profile/:userId",
  verifyToken,
  checkResourceOwnership(),
  validateProfileUpdate,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { userId } = req.params;
      const { name, preferences, studyGoals } = req.body;

      const updateData = {
        lastActive: new Date().toISOString(),
      };

      if (name) updateData.name = name;
      if (preferences) updateData.preferences = JSON.stringify(preferences);
      if (studyGoals) updateData.studyGoals = JSON.stringify(studyGoals);

      const updatedProfile = await tablesDB.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        updateData
      );

      res.json({
        message: "Profile updated successfully",
        profile: {
          id: updatedProfile.$id,
          name: updatedProfile.name,
          preferences: updatedProfile.preferences
            ? JSON.parse(updatedProfile.preferences)
            : {},
          studyGoals: updatedProfile.studyGoals
            ? JSON.parse(updatedProfile.studyGoals)
            : {},
          lastActive: updatedProfile.lastActive,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        error: "Failed to update profile",
        message: "Unable to update user profile",
      });
    }
  }
);

// @route   GET /api/user/achievements/:userId
// @desc    Get user's achievements and badges
// @access  Private
router.get("/achievements/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's study sessions to calculate achievements
    const sessions = await tablesDB.listDocuments(
      DATABASE_ID,
      STUDY_SESSIONS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.orderDesc("createdAt")]
    );

    const achievements = calculateAchievements(sessions.documents);

    res.json({
      userId,
      achievements,
      totalAchievements: achievements.length,
      unlockedToday: achievements.filter(
        (a) =>
          new Date(a.unlockedAt).toDateString() === new Date().toDateString()
      ).length,
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      error: "Failed to get achievements",
      message: "Unable to retrieve achievements",
    });
  }
});

// @route   GET /api/user/dashboard/:userId
// @desc    Get user dashboard data
// @access  Private
router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get recent sessions
    const recentSessions = await tablesDB.listDocuments(
      DATABASE_ID,
      STUDY_SESSIONS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(5),
      ]
    );

    // Get weekly progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const weeklyProgress = await tablesDB.listDocuments(
      DATABASE_ID,
      STUDY_SESSIONS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.greaterThanEqual("createdAt", weekStart.toISOString()),
      ]
    );

    const stats = calculateProgressStats(weeklyProgress.documents);

    res.json({
      userId,
      recentSessions: recentSessions.documents,
      weeklyStats: stats,
      studyStreak: calculateStudyStreak(recentSessions.documents),
      recommendations: generateStudyRecommendations(recentSessions.documents),
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      error: "Failed to get dashboard",
      message: "Unable to retrieve dashboard data",
    });
  }
});

// Helper functions
function calculateProgressStats(sessions) {
  if (!sessions.length) {
    return {
      totalSessions: 0,
      totalStudyTime: 0,
      averageScore: 0,
      averageAccuracy: 0,
      topicBreakdown: {},
      typeBreakdown: {},
    };
  }

  const totalSessions = sessions.length;
  const totalStudyTime = sessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0
  );
  const sessionsWithScores = sessions.filter((s) => s.score !== null);
  const averageScore =
    sessionsWithScores.length > 0
      ? Math.round(
          sessionsWithScores.reduce((sum, s) => sum + s.score, 0) /
            sessionsWithScores.length
        )
      : 0;

  const sessionsWithAccuracy = sessions.filter((s) => s.accuracy !== null);
  const averageAccuracy =
    sessionsWithAccuracy.length > 0
      ? Math.round(
          sessionsWithAccuracy.reduce((sum, s) => sum + s.accuracy, 0) /
            sessionsWithAccuracy.length
        )
      : 0;

  // Topic breakdown
  const topicBreakdown = {};
  sessions.forEach((session) => {
    topicBreakdown[session.topic] = (topicBreakdown[session.topic] || 0) + 1;
  });

  // Type breakdown
  const typeBreakdown = {};
  sessions.forEach((session) => {
    typeBreakdown[session.type] = (typeBreakdown[session.type] || 0) + 1;
  });

  return {
    totalSessions,
    totalStudyTime,
    averageScore,
    averageAccuracy,
    topicBreakdown,
    typeBreakdown,
  };
}

function calculateAchievements(sessions) {
  const achievements = [];
  const totalSessions = sessions.length;
  const totalStudyTime = sessions.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );

  // Session-based achievements
  if (totalSessions >= 1)
    achievements.push({
      name: "First Steps",
      description: "Complete your first study session",
      unlockedAt: sessions[sessions.length - 1].createdAt,
    });
  if (totalSessions >= 10)
    achievements.push({
      name: "Dedicated Learner",
      description: "Complete 10 study sessions",
      unlockedAt: sessions[sessions.length - 10].createdAt,
    });
  if (totalSessions >= 50)
    achievements.push({
      name: "Study Master",
      description: "Complete 50 study sessions",
      unlockedAt: sessions[sessions.length - 50].createdAt,
    });

  // Time-based achievements
  if (totalStudyTime >= 60)
    achievements.push({
      name: "Hour Scholar",
      description: "Study for 1 hour total",
      unlockedAt: new Date().toISOString(),
    });
  if (totalStudyTime >= 600)
    achievements.push({
      name: "Time Warrior",
      description: "Study for 10 hours total",
      unlockedAt: new Date().toISOString(),
    });

  return achievements;
}

function calculateStudyStreak(sessions) {
  if (!sessions.length) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sessions.length; i++) {
    const sessionDate = new Date(sessions[i].createdAt);
    sessionDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function generateStudyRecommendations(sessions) {
  const recommendations = [];

  if (sessions.length === 0) {
    recommendations.push(
      "Start your learning journey with a topic you're interested in!"
    );
    return recommendations;
  }

  const recentTopics = [...new Set(sessions.slice(0, 5).map((s) => s.topic))];
  const averageAccuracy =
    sessions.filter((s) => s.accuracy).reduce((sum, s) => sum + s.accuracy, 0) /
    sessions.filter((s) => s.accuracy).length;

  if (averageAccuracy < 70) {
    recommendations.push(
      "Try reviewing topics with flashcards to improve your accuracy"
    );
  }

  if (recentTopics.length < 3) {
    recommendations.push("Explore new topics to broaden your knowledge");
  }

  recommendations.push(
    "Challenge yourself with the RPG game mode for more engaging learning"
  );

  return recommendations;
}

async function updateUserProgress(userId, session) {
  try {
    // This would update overall user progress metrics
    // Implementation depends on your specific progress tracking needs
    console.log(
      `Updated progress for user ${userId} with session ${session.$id}`
    );
  } catch (error) {
    console.error("Update user progress error:", error);
  }
}

export default router;
