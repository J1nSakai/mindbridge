import express from "express";
import { body, validationResult } from "express-validator";
import { Client, Databases, ID, Query } from "node-appwrite";
import { verifyToken, checkResourceOwnership } from "../middleware/auth.js";

const router = express.Router();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const CHARACTERS_COLLECTION_ID = process.env.APPWRITE_CHARACTERS_COLLECTION_ID;
const BATTLES_COLLECTION_ID = process.env.APPWRITE_BATTLES_COLLECTION_ID;

// Game constants
const GAME_CONFIG = {
  BASE_EXP_PER_LEVEL: 100,
  EXP_MULTIPLIER: 1.5,
  BASE_STATS: {
    health: 100,
    attack: 10,
    defense: 5,
    gold: 50,
  },
  STAT_GROWTH: {
    health: 20,
    attack: 5,
    defense: 3,
  },
};

// Validation middleware
const validateBattleAction = [
  body("questionId").notEmpty().withMessage("Question ID is required"),
  body("selectedAnswer").notEmpty().withMessage("Selected answer is required"),
  body("correctAnswer").notEmpty().withMessage("Correct answer is required"),
  body("enemyId").notEmpty().withMessage("Enemy ID is required"),
];

// @route   GET /api/game/character/:userId
// @desc    Get user's game character
// @access  Private
router.get(
  "/character/:userId",
  verifyToken,
  checkResourceOwnership(),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const character = await databases.getDocument(
        DATABASE_ID,
        CHARACTERS_COLLECTION_ID,
        userId
      );

      res.json({
        character: {
          id: character.$id,
          level: character.level,
          experience: character.experience,
          health: character.health,
          maxHealth: character.maxHealth,
          attack: character.attack,
          defense: character.defense,
          gold: character.gold,
          inventory: character.inventory || [],
          achievements: character.achievements || [],
          currentQuest: character.currentQuest,
          stats: {
            totalBattles: character.totalBattles || 0,
            battlesWon: character.battlesWon || 0,
            questsCompleted: character.questsCompleted || 0,
            totalExperience: character.totalExperience || character.experience,
          },
        },
      });
    } catch (error) {
      console.error("Get character error:", error);

      if (error.code === 404) {
        // Create new character if doesn't exist
        try {
          const newCharacter = await createNewCharacter(req.params.userId);
          return res.json({ character: newCharacter });
        } catch (createError) {
          console.error("Create character error:", createError);
          return res.status(500).json({
            error: "Character creation failed",
            message: "Unable to create game character",
          });
        }
      }

      res.status(500).json({
        error: "Failed to get character",
        message: "Unable to retrieve character data",
      });
    }
  }
);

// @route   POST /api/game/battle/start
// @desc    Start a new battle
// @access  Private
router.post("/battle/start", verifyToken, async (req, res) => {
  try {
    const { userId, topic, difficulty = "intermediate" } = req.body;

    // Get user's character
    const character = await databases.getDocument(
      DATABASE_ID,
      CHARACTERS_COLLECTION_ID,
      userId
    );

    // Generate enemy based on topic and difficulty
    const enemy = generateEnemy(topic, difficulty);

    // Create battle record
    const battle = await databases.createDocument(
      DATABASE_ID,
      BATTLES_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        topic,
        difficulty,
        enemy: JSON.stringify(enemy),
        playerHealth: character.health,
        enemyHealth: enemy.health,
        status: "active",
        questionsAnswered: 0,
        correctAnswers: 0,
        startedAt: new Date().toISOString(),
      }
    );

    res.json({
      battleId: battle.$id,
      enemy,
      playerStats: {
        health: character.health,
        maxHealth: character.maxHealth,
        attack: character.attack,
        defense: character.defense,
        level: character.level,
      },
      battleStatus: "active",
    });
  } catch (error) {
    console.error("Start battle error:", error);
    res.status(500).json({
      error: "Battle start failed",
      message: "Unable to start battle",
    });
  }
});

// @route   POST /api/game/battle/action
// @desc    Process battle action (answer question)
// @access  Private
router.post(
  "/battle/action",
  verifyToken,
  validateBattleAction,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { battleId, questionId, selectedAnswer, correctAnswer, timeTaken } =
        req.body;

      // Get battle data
      const battle = await databases.getDocument(
        DATABASE_ID,
        BATTLES_COLLECTION_ID,
        battleId
      );

      if (battle.status !== "active") {
        return res.status(400).json({
          error: "Battle not active",
          message: "This battle has already ended",
        });
      }

      const enemy = JSON.parse(battle.enemy);
      const isCorrect = selectedAnswer === correctAnswer;

      let playerHealth = battle.playerHealth;
      let enemyHealth = battle.enemyHealth;
      let damage = 0;
      let experienceGained = 0;

      // Get user's character for stats
      const character = await databases.getDocument(
        DATABASE_ID,
        CHARACTERS_COLLECTION_ID,
        battle.userId
      );

      if (isCorrect) {
        // Player attacks enemy
        damage = calculateDamage(character.attack, enemy.defense);
        enemyHealth = Math.max(0, enemyHealth - damage);
        experienceGained = 10 + (timeTaken < 30 ? 5 : 0); // Bonus for quick answers
      } else {
        // Enemy attacks player
        damage = calculateDamage(enemy.attack, character.defense);
        playerHealth = Math.max(0, playerHealth - damage);
      }

      // Update battle record
      const updatedBattle = await databases.updateDocument(
        DATABASE_ID,
        BATTLES_COLLECTION_ID,
        battleId,
        {
          playerHealth,
          enemyHealth,
          questionsAnswered: battle.questionsAnswered + 1,
          correctAnswers: battle.correctAnswers + (isCorrect ? 1 : 0),
        }
      );

      // Check battle end conditions
      let battleResult = null;
      if (enemyHealth <= 0) {
        battleResult = "victory";
        await endBattle(battleId, "victory", character, experienceGained * 2);
      } else if (playerHealth <= 0) {
        battleResult = "defeat";
        await endBattle(
          battleId,
          "defeat",
          character,
          Math.floor(experienceGained / 2)
        );
      }

      res.json({
        battleId,
        isCorrect,
        damage,
        experienceGained,
        playerHealth,
        enemyHealth,
        battleResult,
        enemy: {
          name: enemy.name,
          health: enemyHealth,
          maxHealth: enemy.health,
        },
      });
    } catch (error) {
      console.error("Battle action error:", error);
      res.status(500).json({
        error: "Battle action failed",
        message: "Unable to process battle action",
      });
    }
  }
);

// @route   GET /api/game/leaderboard
// @desc    Get game leaderboard
// @access  Private
router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 10, type = "level" } = req.query;

    // Get top players based on type (level, experience, battles won)
    const orderBy =
      type === "level"
        ? "level"
        : type === "experience"
        ? "totalExperience"
        : "battlesWon";

    const characters = await databases.listDocuments(
      DATABASE_ID,
      CHARACTERS_COLLECTION_ID,
      [Query.orderDesc(orderBy), Query.limit(parseInt(limit))]
    );

    const leaderboard = characters.documents.map((char, index) => ({
      rank: index + 1,
      userId: char.$id,
      level: char.level,
      experience: char.totalExperience || char.experience,
      battlesWon: char.battlesWon || 0,
      totalBattles: char.totalBattles || 0,
      winRate:
        char.totalBattles > 0
          ? Math.round((char.battlesWon / char.totalBattles) * 100)
          : 0,
    }));

    res.json({
      leaderboard,
      type,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({
      error: "Leaderboard fetch failed",
      message: "Unable to get leaderboard data",
    });
  }
});

// Helper functions
async function createNewCharacter(userId) {
  const character = await databases.createDocument(
    DATABASE_ID,
    CHARACTERS_COLLECTION_ID,
    userId,
    {
      level: 1,
      experience: 0,
      health: GAME_CONFIG.BASE_STATS.health,
      maxHealth: GAME_CONFIG.BASE_STATS.health,
      attack: GAME_CONFIG.BASE_STATS.attack,
      defense: GAME_CONFIG.BASE_STATS.defense,
      gold: GAME_CONFIG.BASE_STATS.gold,
      inventory: JSON.stringify([]),
      achievements: JSON.stringify([]),
      totalBattles: 0,
      battlesWon: 0,
      questsCompleted: 0,
      totalExperience: 0,
      createdAt: new Date().toISOString(),
    }
  );

  return {
    id: character.$id,
    level: character.level,
    experience: character.experience,
    health: character.health,
    maxHealth: character.maxHealth,
    attack: character.attack,
    defense: character.defense,
    gold: character.gold,
    inventory: [],
    achievements: [],
  };
}

function generateEnemy(topic, difficulty) {
  const difficultyMultiplier = {
    beginner: 0.8,
    intermediate: 1.0,
    advanced: 1.3,
  };

  const multiplier = difficultyMultiplier[difficulty] || 1.0;

  const enemies = [
    { name: "Knowledge Goblin", type: "basic" },
    { name: "Confusion Troll", type: "intermediate" },
    { name: "Complexity Dragon", type: "advanced" },
    { name: "Doubt Demon", type: "boss" },
  ];

  const enemy = enemies[Math.floor(Math.random() * enemies.length)];

  return {
    name: `${topic} ${enemy.name}`,
    type: enemy.type,
    health: Math.floor(80 * multiplier),
    maxHealth: Math.floor(80 * multiplier),
    attack: Math.floor(15 * multiplier),
    defense: Math.floor(8 * multiplier),
    experienceReward: Math.floor(50 * multiplier),
    goldReward: Math.floor(25 * multiplier),
  };
}

function calculateDamage(attack, defense) {
  const baseDamage = Math.max(1, attack - defense);
  const variance = Math.random() * 0.4 + 0.8; // 80-120% of base damage
  return Math.floor(baseDamage * variance);
}

async function endBattle(battleId, result, character, experienceGained) {
  // Update battle status
  await databases.updateDocument(DATABASE_ID, BATTLES_COLLECTION_ID, battleId, {
    status: result,
    endedAt: new Date().toISOString(),
  });

  // Update character stats
  const newExperience = character.experience + experienceGained;
  const newLevel = calculateLevel(newExperience);
  const leveledUp = newLevel > character.level;

  let updateData = {
    experience: newExperience,
    totalExperience:
      (character.totalExperience || character.experience) + experienceGained,
    totalBattles: (character.totalBattles || 0) + 1,
  };

  if (result === "victory") {
    updateData.battlesWon = (character.battlesWon || 0) + 1;
  }

  if (leveledUp) {
    updateData.level = newLevel;
    updateData.maxHealth =
      GAME_CONFIG.BASE_STATS.health +
      (newLevel - 1) * GAME_CONFIG.STAT_GROWTH.health;
    updateData.health = updateData.maxHealth; // Full heal on level up
    updateData.attack =
      GAME_CONFIG.BASE_STATS.attack +
      (newLevel - 1) * GAME_CONFIG.STAT_GROWTH.attack;
    updateData.defense =
      GAME_CONFIG.BASE_STATS.defense +
      (newLevel - 1) * GAME_CONFIG.STAT_GROWTH.defense;
  }

  await databases.updateDocument(
    DATABASE_ID,
    CHARACTERS_COLLECTION_ID,
    character.$id,
    updateData
  );
}

function calculateLevel(experience) {
  let level = 1;
  let expRequired = GAME_CONFIG.BASE_EXP_PER_LEVEL;

  while (experience >= expRequired) {
    experience -= expRequired;
    level++;
    expRequired = Math.floor(expRequired * GAME_CONFIG.EXP_MULTIPLIER);
  }

  return level;
}

export default router;
