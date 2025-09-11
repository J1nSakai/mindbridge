// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

// API Client Class
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || data.error || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Authentication API
export const authAPI = {
  register: (userData) => apiClient.post("/auth/signup", userData),
  login: (credentials) => apiClient.post("/auth/login", credentials),
  logout: () => apiClient.post("/auth/logout"),
  getCurrentUser: () => apiClient.get("/auth/me"),
};

// User API
export const userAPI = {
  // getProgress: (userId, timeframe = "week") =>
  //   apiClient.get(`/user/progress/${userId}?timeframe=${timeframe}`),
  recordStudySession: (sessionData) =>
    apiClient.post("/user/study-session", sessionData),
  // getProfile: (userId) => apiClient.get(`/user/profile/${userId}`),
  // updateProfile: (userId, profileData) =>
  //   apiClient.put(`/user/profile/${userId}`, profileData),
  // getAchievements: (userId) => apiClient.get(`/user/achievements/${userId}`),
  getDashboard: (userId) => apiClient.get(`/user/dashboard/${userId}`),
  getTopicSessions: (userId, topicId) =>
    apiClient.get(
      `/user/topic-sessions/${userId}?topicId=${encodeURIComponent(topicId)}`
    ),
  updateTopicQuizData: (userId, topicId, quizCompletionData) =>
    apiClient.put(`/user/topic-quiz/${userId}/${topicId}`, quizCompletionData),
};

// AI API
export const aiAPI = {
  generateSummary: (topic, difficulty = "intermediate") =>
    apiClient.post("/ai/summary", { topic, difficulty }),
  generateFlashcards: (topic, count = 10, difficulty = "intermediate") =>
    apiClient.post("/ai/flashcards", { topic, count, difficulty }),
  generateQuiz: (topic, questionCount = 10, difficulty = "intermediate") =>
    apiClient.post("/ai/quiz", { topic, questionCount, difficulty }),
  explainConcept: (concept, context = "") =>
    apiClient.post("/ai/explain", { concept, context }),
};

// Export the API client for direct use if needed
export { apiClient };

// Check if user is authenticated by making a request to the server
export const isAuthenticated = async () => {
  try {
    await apiClient.get("/auth/me");
    return true;
  } catch (error) {
    return false;
  }
};

// Get current user ID from server
export const getCurrentUserId = async () => {
  try {
    const response = await apiClient.get("/auth/me");
    return response.user?.userId || response.user?.$id;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
