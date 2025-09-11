import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookOpen, LogOut, Plus, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import HighlightedText from "../components/ui/HighlightedText";
import LoadingSpinner, {
  LoadingSpinnerOnly,
} from "../components/ui/LoadingSpinner";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { userAPI } from "../services/api";
import { Card, CardContent } from "@/components/ui/card";

const DashboardPage = () => {
  const { user, logout, userId } = useAuth();
  const navigate = useNavigate();
  const [studySessions, setStudySessions] = useState(0);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Helper function to extract topics from study sessions
  const extractTopicsFromSessions = (sessions) => {
    if (!sessions || sessions.length === 0) return [];

    const topicMap = {};

    sessions.forEach((session) => {
      const topicId = session.$id;
      console.log("session", topicId);

      if (!topicMap[topicId]) {
        topicMap[topicId] = {
          id: topicId,
          name: session.topic,
          sessions: [],
          totalSessions: 0,
          totalScore: 0,
          scoredSessions: 0,
        };
      }

      topicMap[topicId].sessions.push(session);
      topicMap[topicId].totalSessions++;

      if (session.score !== null && session.score !== undefined) {
        topicMap[topicId].totalScore += session.score;
        topicMap[topicId].scoredSessions++;
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

          setStudySessions(dashboardData.weeklyStats?.totalSessions || 0);

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

        setStudySessions(0);

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
    console.log("Learn something new clicked");
    navigate("/study");
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background font-sans relative">
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
      <header className="bg-primary-400 border-b-4 sm:border-b-6 lg:border-b-8 border-border relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-primary-500 p-1.5 sm:p-2 rounded-lg rotate-3 border-2 sm:border-4 border-border shadow-shadow sm:shadow-shadow hover:rotate-6 hover:scale-110 transition-all duration-300">
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
                <p className="text-sm sm:text-lg font-bold">
                  {user?.name || "Learner"}
                </p>
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
                  className={"bg-secondary-background"}
                >
                  <div className="flex flex-col">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary-100 transition-colors text-left"
                      >
                        <User className="text-text" size={18} />
                        <span className="font-bold text-text">
                          View Profile
                        </span>
                      </button>
                      <div className=" border-t-2 border-neutral-200 mt-2">
                        <div className="flex items-center justify-between my-2">
                          <span className="text-text font-bold ">Theme </span>
                          <ThemeToggle />
                        </div>
                      </div>

                      {/* <button
                        onClick={() => {
                          // Navigate to settings when implemented
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-primary-100 transition-colors text-left"
                      >
                        <Settings className="text-neutral-600" size={18} />
                        <span className="font-bold text-neutral-950">
                          Settings
                        </span>
                      </button> */}

                      <div className="border-t-2 border-neutral-200 mt-2 pt-2">
                        <button
                          onClick={async () => {
                            setLogoutLoading(true);
                            await logout();
                            setLogoutLoading(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-100 transition-colors text-left"
                        >
                          {logoutLoading ? (
                            <LoadingSpinnerOnly message={"Logging out..."} />
                          ) : (
                            <>
                              <LogOut className="text-red-600" size={18} />
                              <span className="font-bold text-red-600">
                                Logout
                              </span>
                            </>
                          )}
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text mb-4 px-2">
            Welcome back,{" "}
            <HighlightedText>{user?.name || "Learner"}</HighlightedText>!
          </h2>
        </div>

        {/* Quick Stats */}
        <Card className="mb-8 sm:mb-12 bg-secondary-background p-4 sm:p-6 lg:p-8">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-text mb-6 sm:mb-8 text-center">
            Your{" "}
            <HighlightedText bgColor="bg-primary-500">Progress</HighlightedText>
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
            <Card className="text-center p-3 sm:p-4 lg:p-6">
              <CardContent>
                <div className="bg-primary-500 inline-block p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-neutral-950 mb-2 sm:mb-3 rotate-3">
                  <BookOpen className="text-neutral-50 text-lg sm:text-xl lg:text-2xl" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary-500 mb-1 sm:mb-2">
                  {studySessions}
                </div>
                <div className="text-text font-bold text-xs sm:text-sm lg:text-base">
                  Study Sessions
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>

        {/* Topics Section */}
        <Card className="bg-secondary-background p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-text">
              Your{" "}
              <HighlightedText bgColor="bg-primary-500">
                Learning Topics
              </HighlightedText>
            </h3>
            {topics.length > 0 && (
              <Button
                onClick={handleLearnNewClick}
                className="bg-primary-400 text-text font-bold text-sm sm:text-base lg:text-lg px-4 sm:px-6 py-2 sm:py-3 transition-all w-full sm:w-auto"
              >
                <Plus className="mr-2" />
                Learn Something New
              </Button>
            )}
          </div>

          {topics.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
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
              </CardContent>
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
                      className={` p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105`}
                    >
                      <CardContent>
                        <div className="bg-primary-500 inline-block p-2 sm:p-3 rounded-lg border-2 sm:border-4 border-border mb-3 sm:mb-4 rotate-3">
                          <BookOpen className="text-lg sm:text-xl lg:text-2xl text-neutral-50" />
                        </div>
                        <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-text mb-2 sm:mb-3">
                          {topic.name}
                        </h4>
                        <div className="mb-3 sm:mb-4"></div>
                        <div className="flex justify-between text-xs sm:text-sm font-bold text-text">
                          <span>{topic.lastStudied}</span>
                        </div>
                      </CardContent>
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
