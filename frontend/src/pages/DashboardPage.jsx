import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import HighlightedText from "../components/ui/HighlightedText";
import { userAPI } from "../services/api";
import {
  BookOpen,
  TrendingUp,
  Trophy,
  Star,
  Plus,
  User,
  Settings,
  LogOut,
} from "lucide-react";

// Simple Card component matching neubrutalism style
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-neutral-50 rounded-lg border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${className}`}
  >
    {children}
  </div>
);

const DashboardPage = () => {
  const { user, logout, userId } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    studySessions: 0,
    level: 1,
    achievements: 0,
    battlesWon: 0,
  });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Helper function to extract topics from study sessions
  const extractTopicsFromSessions = (sessions) => {
    if (!sessions || sessions.length === 0) return [];

    const topicMap = {};

    sessions.forEach((session) => {
      const topicName = session.topic;
      if (!topicMap[topicName]) {
        topicMap[topicName] = {
          id: encodeURIComponent(topicName.toLowerCase().replace(/\s+/g, "-")),
          name: topicName,
          sessions: [],
          totalSessions: 0,
          totalScore: 0,
          scoredSessions: 0,
        };
      }

      topicMap[topicName].sessions.push(session);
      topicMap[topicName].totalSessions++;

      if (session.score !== null && session.score !== undefined) {
        topicMap[topicName].totalScore += session.score;
        topicMap[topicName].scoredSessions++;
      }
    });

    return Object.values(topicMap).map((topic) => {
      const averageScore =
        topic.scoredSessions > 0
          ? Math.round(topic.totalScore / topic.scoredSessions)
          : 0;

      const lastSession = topic.sessions.sort(
        (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)
      )[0];

      const lastStudiedDate = new Date(lastSession.$createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - lastStudiedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let lastStudied;
      if (diffDays === 1) {
        lastStudied = "Yesterday";
      } else if (diffDays < 7) {
        lastStudied = `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        lastStudied = weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
      } else {
        const months = Math.floor(diffDays / 30);
        lastStudied = months === 1 ? "1 month ago" : `${months} months ago`;
      }

      return {
        id: topic.id,
        name: topic.name,
        progress: averageScore, // Use average score as progress
        lastStudied,
        sessionsCount: topic.totalSessions,
      };
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (userId) {
          console.log("🔍 Fetching dashboard data for user:", userId);

          // Test API connection first
          console.log("📡 Testing API connection...");

          // Fetch user dashboard data
          console.log("📊 Fetching dashboard data...");
          const dashboardData = await userAPI.getDashboard(userId);
          console.log("✅ Dashboard data received:", dashboardData);

          // Character data removed - game functionality disabled
          console.log("🎮 Game functionality disabled...");
          // const characterData = await gameAPI.getCharacter(userId);
          console.log("✅ Skipping character data fetch");

          // Update stats with real data
          const newStats = {
            studySessions: dashboardData.weeklyStats?.totalSessions || 0,
            level: 1,
            achievements: dashboardData.weeklyStats?.achievements || 0,
            battlesWon: 0,
          };

          console.log("📈 Setting new stats:", newStats);
          setStats(newStats);

          // Extract topics from all sessions
          const allSessions = dashboardData.recentSessions || [];
          console.log("📊 All sessions received:", allSessions);
          const extractedTopics = extractTopicsFromSessions(allSessions);
          console.log("📚 Extracted topics:", extractedTopics);
          setTopics(extractedTopics);

          console.log("🎉 Dashboard data loaded successfully!");
        } else {
          console.log("❌ No userId available");
        }
      } catch (error) {
        console.error("❌ Failed to fetch dashboard data:", error);
        console.error("🔍 Error details:", error.message);
        console.error("📍 Error stack:", error.stack);

        // Use default stats on error
        setStats({
          studySessions: 0,
          level: 1,
          achievements: 0,
          battlesWon: 0,
        });

        // Use empty topics on error
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTopicClick = (topicId) => {
    // Navigate to topic page with topic ID
    console.log("Topic clicked:", topicId);
    navigate(`/topic/${topicId}`);
  };

  const handleLearnNewClick = () => {
    // Navigate to create new topic - we'll implement this later
    console.log("Learn something new clicked");
    navigate("/study");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-xl font-bold text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Header */}
      <header className="bg-primary-400 border-b-8 border-neutral-950 shadow-[0px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 p-2 rounded-lg rotate-3 border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-6 hover:scale-110 transition-all duration-300">
                <span className="text-2xl font-extrabold text-neutral-50">
                  MB
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-neutral-50 hover:scale-105 transition-transform duration-300">
                MindBridge
              </h1>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
              <div className="text-right text-neutral-50">
                <p className="text-lg font-bold">{user?.name || "Learner"}</p>
                <p className="text-sm opacity-90">Level {stats.level}</p>
              </div>
              <Avatar
                size="xl"
                className="cursor-pointer border-4 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 hover:rotate-3 transition-all duration-300"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <AvatarFallback className="text-xl">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute top-full right-0 mt-4 w-64 z-50">
                  <Card className="p-0 animate-fade-in">
                    <div className="p-4 border-b-2 border-neutral-200">
                      <div className="flex items-center gap-3">
                        <Avatar size="md">
                          <AvatarFallback>
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-neutral-950">
                            {user?.name || "Learner"}
                          </p>

                          <p className="text-xs text-neutral-500">
                            Level {stats.level}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary-100 transition-colors text-left"
                      >
                        <User className="text-neutral-600" size={18} />
                        <span className="font-bold text-neutral-950">
                          View Profile
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          // Navigate to settings when implemented
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary-100 transition-colors text-left"
                      >
                        <Settings className="text-neutral-600" size={18} />
                        <span className="font-bold text-neutral-950">
                          Settings
                        </span>
                      </button>

                      <div className="border-t-2 border-neutral-200 mt-2 pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-100 transition-colors text-left"
                        >
                          <LogOut className="text-red-600" size={18} />
                          <span className="font-bold text-red-600">Logout</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Message */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black text-neutral-950 mb-4 hover:scale-105 transition-transform duration-300">
            Welcome back,{" "}
            <HighlightedText>{user?.name || "Learner"}</HighlightedText>!
          </h2>
        </div>

        {/* Quick Stats */}
        <Card className="mb-12 bg-primary-200 p-8">
          <h3 className="text-3xl font-black text-neutral-950 mb-8 text-center">
            Your{" "}
            <HighlightedText bgColor="bg-neutral-950">Progress</HighlightedText>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:scale-105 hover:rotate-1 transition-all duration-300">
              <div className="bg-primary-500 inline-block p-3 rounded-lg border-4 border-neutral-950 mb-3 rotate-3">
                <BookOpen className="text-neutral-50 text-2xl" />
              </div>
              <div className="text-4xl font-black text-primary-500 mb-2">
                {stats.studySessions}
              </div>
              <div className="text-neutral-950 font-bold">Study Sessions</div>
            </Card>

            <Card className="text-center p-6 hover:scale-105 hover:-rotate-1 transition-all duration-300">
              <div className="bg-primary-600 inline-block p-3 rounded-lg border-4 border-neutral-950 mb-3 -rotate-3">
                <TrendingUp className="text-neutral-50 text-2xl" />
              </div>
              <div className="text-4xl font-black text-primary-600 mb-2">
                {stats.level}
              </div>
              <div className="text-neutral-950 font-bold">Level</div>
            </Card>

            <Card className="text-center p-6 hover:scale-105 hover:rotate-2 transition-all duration-300">
              <div className="bg-neutral-950 inline-block p-3 rounded-lg border-4 border-neutral-950 mb-3 rotate-6">
                <Star className="text-neutral-50 text-2xl" />
              </div>
              <div className="text-4xl font-black text-neutral-950 mb-2">
                {stats.achievements}
              </div>
              <div className="text-neutral-950 font-bold">Achievements</div>
            </Card>

            <Card className="text-center p-6 hover:scale-105 hover:-rotate-2 transition-all duration-300">
              <div className="bg-primary-300 inline-block p-3 rounded-lg border-4 border-neutral-950 mb-3 -rotate-6">
                <Trophy className="text-neutral-950 text-2xl" />
              </div>
              <div className="text-4xl font-black text-primary-600 mb-2">
                {stats.battlesWon}
              </div>
              <div className="text-neutral-950 font-bold">Battles Won</div>
            </Card>
          </div>
        </Card>

        {/* Topics Section */}
        <Card className="bg-primary-300 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-black text-neutral-950">
              Your{" "}
              <HighlightedText bgColor="bg-neutral-950">
                Learning Topics
              </HighlightedText>
            </h3>
            {topics.length > 0 && (
              <Button
                onClick={handleLearnNewClick}
                className="bg-neutral-950 text-neutral-50 font-bold text-lg px-6 py-3 hover:scale-105 hover:-translate-y-1 hover:rotate-1 transition-all duration-300"
              >
                <Plus className="mr-2" />
                Learn Something New
              </Button>
            )}
          </div>

          {topics.length === 0 ? (
            <Card className="text-center py-16">
              <div className="bg-primary-500 inline-block p-8 rounded-xl border-4 border-neutral-950 mb-6 rotate-3 animate-bounce shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen className="text-6xl text-neutral-50" />
              </div>
              <h4 className="text-3xl font-black text-neutral-950 mb-4">
                No study topics yet!
              </h4>
              <p className="text-xl text-neutral-600 font-bold mb-8">
                Complete your first study session to see topics here
              </p>
              <Button
                onClick={handleLearnNewClick}
                className="bg-primary-500 text-neutral-50 font-bold text-xl px-8 py-4 hover:scale-105 hover:-translate-y-2 hover:rotate-3 transition-all duration-300"
              >
                <Plus className="mr-2" />
                Start Learning
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, index) => {
                const colors = [
                  "bg-primary-200",
                  "bg-primary-300",
                  "bg-neutral-200",
                  "bg-primary-100",
                  "bg-primary-400",
                  "bg-neutral-300",
                ];
                const rotations = [
                  "rotate-1",
                  "-rotate-1",
                  "rotate-2",
                  "-rotate-2",
                ];

                return (
                  <div
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <Card
                      className={`${
                        colors[index % colors.length]
                      } p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105 ${
                        rotations[index % rotations.length]
                      } hover:rotate-0`}
                    >
                      <div className="bg-neutral-50 inline-block p-3 rounded-lg border-4 border-neutral-950 mb-4 rotate-3">
                        <BookOpen className="text-2xl text-neutral-950" />
                      </div>
                      <h4 className="text-xl font-black text-neutral-950 mb-3">
                        {topic.name}
                      </h4>
                      <div className="mb-4">
                        {/* <div className="flex justify-between text-sm font-bold text-neutral-950 mb-2">
                        <span>Progress</span>
                        <span>{topic.progress}%</span>
                      </div> */}
                        {/* <div className="w-full bg-neutral-950 rounded-full h-3 border-2 border-neutral-950">
                        <div
                          className="bg-primary-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${topic.progress}%` }}
                        ></div>
                      </div> */}
                      </div>
                      <div className="flex justify-between text-sm font-bold text-neutral-950">
                        {/* <span>{topic.sessionsCount} sessions</span> */}
                        <span>{topic.lastStudied}</span>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
