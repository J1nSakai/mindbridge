import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import HighlightedText from "../components/ui/HighlightedText";
import LoadingSpinner from "../components/ui/LoadingSpinner";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-primary-100 font-sans relative">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #87888c 1px, transparent 1px),
            linear-gradient(to bottom, #87888c 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Header */}
      <header className="bg-primary-400 border-b-4 sm:border-b-6 lg:border-b-8 border-neutral-950 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-primary-500 p-1.5 sm:p-2 rounded-lg rotate-3 border-2 sm:border-4 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-6 hover:scale-110 transition-all duration-300">
                <span className="text-lg sm:text-2xl font-extrabold text-neutral-50">
                  MB
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-50">
                MindBridge
              </h1>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-2 sm:gap-4 relative">
              <div className="hidden sm:block text-right text-neutral-50">
                <p className="text-sm sm:text-lg font-bold">{user?.name || "Learner"}</p>
                <p className="text-xs sm:text-sm opacity-90">Level {stats.level}</p>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Avatar
                    size="xl"
                    className="cursor-pointer border-2 sm:border-4 border-neutral-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 hover:rotate-3 transition-all duration-300 w-10 h-10 sm:w-12 sm:h-12"
                  >
                    <AvatarFallback className="text-sm sm:text-xl">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                {/* Profile Dropdown */}
                <PopoverContent
                  sideOffset={10}
                  align="left"
                  className={"bg-neutral-50"}
                >
                  <div className="flex flex-col">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
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
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-100 transition-colors text-left"
                        >
                          <LogOut className="text-red-600" size={18} />
                          <span className="font-bold text-red-600">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Welcome Message */}
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-neutral-950 mb-4 px-2">
            Welcome back,{" "}
            <HighlightedText>{user?.name || "Learner"}</HighlightedText>!
          </h2>
        </div>

        {/* Quick Stats */}
        <Card className="mb-8 sm:mb-12 bg-primary-200 p-4 sm:p-6 lg:p-8">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-950 mb-6 sm:mb-8 text-center">
            Your{" "}
            <HighlightedText bgColor="bg-neutral-950">Progress</HighlightedText>
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <Card className="text-center p-3 sm:p-4 lg:p-6 hover:-rotate-3 transition-all duration-200">
              <div className="bg-primary-500 inline-block p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-neutral-950 mb-2 sm:mb-3 rotate-3">
                <BookOpen className="text-neutral-50 text-lg sm:text-xl lg:text-2xl" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-500 mb-1 sm:mb-2">
                {stats.studySessions}
              </div>
              <div className="text-neutral-950 font-bold text-xs sm:text-sm lg:text-base">Study Sessions</div>
            </Card>

            <Card className="text-center p-3 sm:p-4 lg:p-6 hover:rotate-3 transition-all duration-200">
              <div className="bg-primary-600 inline-block p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-neutral-950 mb-2 sm:mb-3 -rotate-3">
                <TrendingUp className="text-neutral-50 text-lg sm:text-xl lg:text-2xl" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-600 mb-1 sm:mb-2">
                {stats.level}
              </div>
              <div className="text-neutral-950 font-bold text-xs sm:text-sm lg:text-base">Level</div>
            </Card>

            <Card className="text-center p-3 sm:p-4 lg:p-6 hover:-rotate-3 transition-all duration-200">
              <div className="bg-neutral-950 inline-block p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-neutral-950 mb-2 sm:mb-3 rotate-6">
                <Star className="text-neutral-50 text-lg sm:text-xl lg:text-2xl" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-950 mb-1 sm:mb-2">
                {stats.achievements}
              </div>
              <div className="text-neutral-950 font-bold text-xs sm:text-sm lg:text-base">Achievements</div>
            </Card>

            <Card className="text-center p-3 sm:p-4 lg:p-6 hover:rotate-3 transition-all duration-200">
              <div className="bg-primary-300 inline-block p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-neutral-950 mb-2 sm:mb-3 -rotate-6">
                <Trophy className="text-neutral-950 text-lg sm:text-xl lg:text-2xl" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-600 mb-1 sm:mb-2">
                {stats.battlesWon}
              </div>
              <div className="text-neutral-950 font-bold text-xs sm:text-sm lg:text-base">Battles Won</div>
            </Card>
          </div>
        </Card>

        {/* Topics Section */}
        <Card className="bg-primary-300 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-950">
              Your{" "}
              <HighlightedText bgColor="bg-neutral-950">
                Learning Topics
              </HighlightedText>
            </h3>
            {topics.length > 0 && (
              <Button
                onClick={handleLearnNewClick}
                className="bg-neutral-950 text-neutral-50 font-bold text-sm sm:text-base lg:text-lg px-4 sm:px-6 py-2 sm:py-3 hover:scale-105 hover:-translate-y-1 hover:rotate-1 transition-all duration-300 w-full sm:w-auto"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                      } p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105 ${
                        rotations[index % rotations.length]
                      } hover:rotate-0`}
                    >
                      <div className="bg-neutral-50 inline-block p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-neutral-950 mb-3 sm:mb-4 rotate-3">
                        <BookOpen className="text-lg sm:text-xl lg:text-2xl text-neutral-950" />
                      </div>
                      <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-neutral-950 mb-2 sm:mb-3">
                        {topic.name}
                      </h4>
                      <div className="mb-3 sm:mb-4">
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
                      <div className="flex justify-between text-xs sm:text-sm font-bold text-neutral-950">
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
