// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// API Client Class
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("authToken");
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

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
  logout: () => {
    apiClient.setToken(null);
    return Promise.resolve();
  },
  getCurrentUser: () => apiClient.get("/auth/me"),
};

// User API
export const userAPI = {
  getProgress: (userId, timeframe = "week") =>
    apiClient.get(`/user/progress/${userId}?timeframe=${timeframe}`),
  recordStudySession: (sessionData) =>
    apiClient.post("/user/study-session", sessionData),
  getProfile: (userId) => apiClient.get(`/user/profile/${userId}`),
  updateProfile: (userId, profileData) =>
    apiClient.put(`/user/profile/${userId}`, profileData),
  getAchievements: (userId) => apiClient.get(`/user/achievements/${userId}`),
  getDashboard: (userId) => apiClient.get(`/user/dashboard/${userId}`),
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

// Helper function to set token from login response
export const setAuthToken = (token) => {
  apiClient.setToken(token);
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!apiClient.token;
};

// Helper function to get current user ID from token
export const getCurrentUserId = () => {
  if (!apiClient.token) return null;

  try {
    const payload = JSON.parse(atob(apiClient.token.split(".")[1]));
    return payload.userId;
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
};
