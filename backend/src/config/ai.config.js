// AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER;
const AI_API_KEY = process.env.AI_API_KEY;

export const initializeAIClient = async () => {
  if (!AI_API_KEY) {
    console.warn(
      `⚠️  Warning: AI_API_KEY environment variable is missing. AI features will be disabled.`
    );
    return null;
  }

  try {
    // Groq client (OpenAI compatible)
    const { OpenAI } = await import("openai");
    const aiClient = new OpenAI({
      apiKey: AI_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    console.log(
      `✅ AI client initialized successfully with provider: ${AI_PROVIDER}`
    );
    return aiClient;
  } catch (error) {
    console.error(`❌ Failed to initialize AI client:`, error.message);
    return null;
  }
};
