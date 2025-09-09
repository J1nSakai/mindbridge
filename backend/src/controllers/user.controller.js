import { Query } from "node-appwrite";
import { ID } from "node-appwrite";
import { validationResult } from "express-validator";
import { TablesDataB } from "../config/appwrite.js";

const tablesDB = TablesDataB;

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const STUDY_SESSIONS_COLLECTION_ID =
  process.env.APPWRITE_STUDY_SESSIONS_COLLECTION_ID;
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID;

export const getUserLearningProgress = async (req, res) => {
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
    const sessions = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: STUDY_SESSIONS_COLLECTION_ID,
      queries: [
        Query.equal("userId", userId),
        Query.greaterThanEqual("$createdAt", startDate.toISOString()),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ],
    });

    // Calculate progress statistics
    const stats = calculateProgressStats(sessions.rows || []);

    res.json({
      userId,
      timeframe,
      stats,
      recentSessions: (sessions.rows || []).slice(0, 10),
      totalSessions: sessions.total || 0,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      error: "Failed to get progress",
      message: "Unable to retrieve progress data",
    });
  }
};

export const recordNewStudySession = async (req, res) => {
  try {
    console.log("📥 Received study session request:", {
      body: req.body,
      headers: req.headers.authorization
        ? "Bearer token present"
        : "No auth token",
      user: req.user,
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation errors:", errors.array());
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const {
      userId,
      topic,
      type,
      questionsAnswered,
      correctAnswers,
      totalQuestions,
      generatedSummary,
      flashCards,
      quizData,
      selectedQuizAnswers,
    } = req.body;

    console.log("📊 Creating session with data:", {
      userId,
      topic,
      type,
      questionsAnswered,
      correctAnswers,
      totalQuestions,
      selectedQuizAnswers,
      DATABASE_ID,
      STUDY_SESSIONS_COLLECTION_ID,
    });

    const session = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: STUDY_SESSIONS_COLLECTION_ID,
      rowId: ID.unique(),
      data: {
        userId,
        topic,
        type,
        questionsAnswered: questionsAnswered || null,
        correctAnswers: correctAnswers || null,
        totalQuestions: totalQuestions || null,
        generatedSummary: generatedSummary || null,
        flashCards: flashCards || null,
        quizData: quizData || null,
        selectedQuizAnswers: selectedQuizAnswers || null,
      },
    });

    console.log("✅ Session created successfully:", session.$id);

    // Update user's overall progress
    await updateUserProgress(userId, session);

    res.status(201).json({
      message: "Study session recorded successfully",
      session: {
        id: session.$id,
        topic: session.topic,
        type: session.type,
        createdAt: session.$createdAt,
        questionsAnswered: session.questionsAnswered,
        correctAnswers: session.correctAnswers,
        totalQuestions: session.totalQuestions,
        selectedQuizAnswers: session.selectedQuizAnswers,
      },
    });
  } catch (error) {
    console.error("❌ Record study session error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response,
    });
    res.status(500).json({
      error: "Failed to record session",
      message: error.message || "Unable to save study session",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getUserProfileAndPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await tablesDB.getRow({
      databaseId: DATABASE_ID,
      tableId: USERS_COLLECTION_ID,
      rowId: userId,
    });

    res.json({
      profile: {
        id: profile.$id,
        name: profile.name,
        email: profile.email,
        preferences: profile.preferences ? JSON.parse(profile.preferences) : {},
        studyGoals: profile.studyGoals ? JSON.parse(profile.studyGoals) : {},
        joinedAt: profile.$createdAt,
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
};

export const updateUserProfileAndPreferences = async (req, res) => {
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

    const updatedProfile = await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: USERS_COLLECTION_ID,
      rowId: userId,
      data: updateData,
    });

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
};

export const getUserAchievementsAndBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's study sessions to calculate achievements
    const sessions = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: STUDY_SESSIONS_COLLECTION_ID,
      queries: [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
    });

    const achievements = calculateAchievements(sessions.rows || []);

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
};

export const testAPIConnection = async (req, res) => {
  try {
    res.json({
      message: "API is working!",
      user: req.user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test route error:", error);
    res.status(500).json({
      error: "Test failed",
      message: error.message,
    });
  }
};

export const getUserDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Dashboard request for user: ${userId}`);

    // Get all user sessions for topic extraction
    console.log("📊 Fetching all user sessions...");
    const allSessions = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: STUDY_SESSIONS_COLLECTION_ID,
      queries: [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(100), // Get more sessions for topic analysis
      ],
    });
    console.log(`✅ Found ${allSessions.rows?.length || 0} total sessions`);

    // Get weekly progress
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    console.log(
      `📅 Fetching weekly progress since: ${weekStart.toISOString()}`
    );

    const weeklyProgress = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: STUDY_SESSIONS_COLLECTION_ID,
      queries: [
        Query.equal("userId", userId),
        Query.greaterThanEqual("$createdAt", weekStart.toISOString()),
      ],
    });
    console.log(`✅ Found ${weeklyProgress.rows?.length || 0} weekly sessions`);

    const stats = calculateProgressStats(weeklyProgress.rows || []);

    // Calculate achievements based on all sessions
    const allAchievements = calculateAchievements(allSessions.rows || []);
    stats.achievements = allAchievements.length; // Add achievements count to stats

    console.log("📈 Calculated stats:", stats);
    console.log("🏆 Total achievements:", allAchievements.length);

    const dashboardData = {
      userId,
      recentSessions: allSessions.rows || [], // Return all sessions for topic extraction
      weeklyStats: stats,
      studyStreak: calculateStudyStreak(allSessions.rows || []),
      recommendations: generateStudyRecommendations(allSessions.rows || []),
    };

    console.log("🎉 Dashboard data prepared successfully");
    res.json(dashboardData);
  } catch (error) {
    console.error("❌ Get dashboard error:", error);
    console.error("🔍 Error details:", error.message);
    console.error("📍 Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to get dashboard",
      message: "Unable to retrieve dashboard data",
      details: error.message,
    });
  }
};

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
    // Count "complete" session type as one of each: summary, flashcards, and quiz
    // This ensures the type breakdown remains accurate after switching to the new recording method
    if (session.type === "complete") {
      typeBreakdown["summary"] = (typeBreakdown["summary"] || 0) + 1;
      typeBreakdown["flashcards"] = (typeBreakdown["flashcards"] || 0) + 1;
      typeBreakdown["quiz"] = (typeBreakdown["quiz"] || 0) + 1;
    } else {
      typeBreakdown[session.type] = (typeBreakdown[session.type] || 0) + 1;
    }
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
      unlockedAt: sessions[sessions.length - 1].$createdAt,
    });
  if (totalSessions >= 10)
    achievements.push({
      name: "Dedicated Learner",
      description: "Complete 10 study sessions",
      unlockedAt: sessions[sessions.length - 10].$createdAt,
    });
  if (totalSessions >= 50)
    achievements.push({
      name: "Study Master",
      description: "Complete 50 study sessions",
      unlockedAt: sessions[sessions.length - 50].$createdAt,
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
    const sessionDate = new Date(sessions[i].$createdAt);
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

  if (!sessions || sessions.length === 0) {
    recommendations.push(
      "Start your learning journey with a topic you're interested in!"
    );
    return recommendations;
  }

  const recentTopics = [...new Set(sessions.slice(0, 5).map((s) => s.topic))];
  const sessionsWithAccuracy = sessions.filter(
    (s) => s.accuracy !== null && s.accuracy !== undefined
  );

  if (sessionsWithAccuracy.length > 0) {
    const averageAccuracy =
      sessionsWithAccuracy.reduce((sum, s) => sum + s.accuracy, 0) /
      sessionsWithAccuracy.length;

    if (averageAccuracy < 70) {
      recommendations.push(
        "Try reviewing topics with flashcards to improve your accuracy"
      );
    }
  }

  if (recentTopics.length < 3) {
    recommendations.push("Explore new topics to broaden your knowledge");
  }

  recommendations.push(
    "Test your knowledge with interactive quizzes for better retention"
  );

  return recommendations;
}

// Get topic-specific sessions
export const getTopicSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { topicId } = req.query;

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: "Topic parameter is required",
      });
    }

    console.log(`🔍 Fetching sessions for user ${userId}, topic: ${topicId}`);

    // Get all sessions for this user and topic
    const sessions = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: STUDY_SESSIONS_COLLECTION_ID,
      queries: [
        Query.equal("userId", userId),
        Query.equal("$id", topicId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ],
    });

    console.log(
      `📊 Found ${sessions.rows?.length || 0} sessions for topic: ${topicId}`
    );

    if (!sessions.rows || sessions.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sessions found for this topic",
      });
    }

    // Return the sessions data
    res.status(200).json({
      success: true,
      data: sessions.rows,
      message: `Found ${sessions.rows.length} sessions for topic: ${topicId}`,
    });
  } catch (error) {
    console.error("❌ Error fetching topic sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch topic sessions",
      error: error.message,
    });
  }
};

export const updateTopicQuizData = async (req, res) => {
  try {
    const { topicId } = req.params;
    const quizCompletionData = req.body;
    console.log("topic ID", topicId);
    console.log("quiz completion Data", quizCompletionData);

    // Update the user's quiz data for this topic
    await tablesDB.updateRow({
      databaseId: DATABASE_ID,
      tableId: STUDY_SESSIONS_COLLECTION_ID,
      rowId: topicId,
      data: {
        correctAnswers: quizCompletionData.correctAnswers,
        selectedQuizAnswers: JSON.stringify(quizCompletionData.selectedAnswers),
      },
    });

    res.status(200).json({
      success: true,
      message: "Quiz data updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating quiz data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quiz data",
      error: error.message,
    });
  }
};
